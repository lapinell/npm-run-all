/**
 * @author Toru Nagashima
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
import matchTasks from "./match-tasks";
import readTasks from "./read-tasks";
import runTasksInParallel from "./run-tasks-in-parallel";
import runTasksInSequencial from "./run-tasks-in-sequencial";

/**
 * Converts a given value to an array.
 *
 * @param {string|string[]|null|undefined} x - A value to convert.
 * @returns {string[]} An array.
 */
function toArray(x) {
    if (x == null) {
        return [];
    }
    return Array.isArray(x) ? x : [x];
}

/**
 * Runs npm-scripts which are matched with given patterns.
 *
 * @param {string|string[]} patternOrPatterns - Patterns to run.
 *   A pattern is a npm-script name or a Glob-like pattern.
 * @param {object|undefined} [options] Optional.
 * @param {boolean} options.parallel -
 *   If this is `true`, run scripts in parallel.
 *   Otherwise, run scripts in sequencial.
 *   Default is `false`.
 * @param {stream.Readable|null} options.stdin -
 *   A readable stream to send messages to stdin of child process.
 *   If this is `null`, ignores it.
 *   If this is `process.stdin`, inherits it.
 *   Otherwise, makes a pipe.
 *   Default is `null`.
 * @param {stream.Writable|null} options.stdout -
 *   A writable stream to receive messages from stdout of child process.
 *   If this is `null`, cannot send.
 *   If this is `process.stdout`, inherits it.
 *   Otherwise, makes a pipe.
 *   Default is `null`.
 * @param {stream.Writable|null} options.stderr -
 *   A writable stream to receive messages from stderr of child process.
 *   If this is `null`, cannot send.
 *   If this is `process.stderr`, inherits it.
 *   Otherwise, makes a pipe.
 *   Default is `null`.
 * @param {string[]} options.taskList -
 *   Actual name list of npm-scripts.
 *   This function search npm-script names in this list.
 *   If this is `null`, this function reads `package.json` of current directly.
 * @returns {Promise}
 *   A promise object which becomes fullfilled when all npm-scripts are completed.
 */
export default function npmRunAll(
    patternOrPatterns,
    {
        parallel = false,
        stdin = null,
        stdout = null,
        stderr = null,
        taskList = null
    } = {}
) {
    try {
        const patterns = toArray(patternOrPatterns);
        if (patterns.length === 0) {
            return Promise.resolve(null);
        }
        if (taskList != null && Array.isArray(taskList) === false) {
            throw new Error("Invalid options.taskList");
        }

        const tasks = matchTasks(taskList || readTasks(), patterns);
        if (tasks.length === 0) {
            throw new Error(`Matched tasks not found: ${patterns.join(", ")}`);
        }

        return (
            parallel ? runTasksInParallel(tasks, stdin, stdout, stderr) :
            /* else */ runTasksInSequencial(tasks, stdin, stdout, stderr)
        );
    }
    catch (err) {
        return Promise.reject(new Error(err.message));
    }
}
