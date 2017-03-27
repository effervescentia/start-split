import { resolve } from 'path';
import * as Start from 'start';
import * as inputConnector from 'start-input-connector';
import * as concurrent from 'start-concurrent';

const split = (input, dirs, add) => {
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

const splitCon = (input, dirs) => function splitConcurrent(log, reporter) {
  const start = Start(reporter);

  return start(concurrent(
    ...split(input, dirs, (tasks, subtasks) => tasks.push(() => start(...subtasks)))
  ));
};

const splitSeq = (input, dirs) => function splitSequential(log, reporter) {
  return Start(reporter)(
    ...split(input, dirs, (tasks, subtasks) => tasks.push(...subtasks))
  );
};

export default (dirs, concurr = true) => (input) => {
  if (!input) {
    return () => Promise.reject(new Error('no input to split'));
  }

  // eslint-disable-next-line no-ternary
  return concurr ? splitCon(input, dirs) : splitSeq(input, dirs);
};
