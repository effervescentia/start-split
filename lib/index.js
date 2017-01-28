import Start from 'start';
import inputConnector from 'start-input-connector';
import concurrent from 'start-concurrent';
import { resolve } from 'path';

export default (dirs, concurr = true) => {
  return (input) => {
    return concurr
      ? (log, reporter) => {
        const start = Start(reporter);
        return start(concurrent(...splitTasks(input, dirs, (tasks, subtasks) => tasks.push(() => start(...subtasks)))));
      }
      : (log, reporter) => Start(reporter)(...splitTasks(input, dirs, (tasks, subtasks) => tasks.push(...subtasks)));
  };
};

const splitTasks = (input, dirs, add) => Object.keys(dirs)
  .reduce((tasks, dir) => {
    const srcDir = resolve(process.cwd(), dir);
    const filter = (file) => file.path.startsWith(srcDir);
    add(tasks, [
      inputConnector(input.filter(filter)),
      ...dirs[dir]()
    ]);
    return tasks;
  }, []);
