import { resolve } from 'path';
import Start from 'start';
import inputConnector from 'start-input-connector';
import concurrent from 'start-concurrent';

const splitTasks = (input, dirs, add) => {
  return Object.keys(dirs)
    .reduce((tasks, dir) => {
      const srcDir = resolve(process.cwd(), dir);
      const filter = (file) => file.path.startsWith(srcDir);

      add(tasks, [
        inputConnector(input.filter(filter)),
        ...dirs[dir]()
      ]);

      return tasks;
    }, []);
};

const splitConcurrent = (input, dirs) => (log, reporter) => {
  const start = Start(reporter);

  return start(concurrent(
    ...splitTasks(input, dirs, (tasks, subtasks) => tasks.push(() => start(...subtasks)))
  ));
};

const splitSequential = (input, dirs) => (log, reporter) =>
  Start(reporter)(
    ...splitTasks(input, dirs, (tasks, subtasks) => tasks.push(...subtasks))
  );

export default (dirs, concurr = true) => (input) => {
  if (!input) {
    return () => Promise.reject(new Error('no input to split'));
  }

  // eslint-disable-next-line no-ternary
  return concurr ? splitConcurrent(input, dirs) : splitSequential(input, dirs);
};
