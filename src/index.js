import path from 'path';
import Start from 'start';
import inputConnector from 'start-input-connector';
import concurrent from 'start-concurrent';
import { fromSource as getSourceMapFromSource, removeComments } from 'convert-source-map';

const extendPath = (filepath, depth) => {
  return path.join('..'.repeat(depth), filepath);
};

const split = (input, dirs, add) => {
  return Object.keys(dirs)
    .reduce((tasks, dir) => {
      const depth = dir.split(path.sep).length;
      const srcDir = path.resolve(process.cwd(), dir);
      const filter = (file) => file.path.startsWith(srcDir);

      add(tasks, [
        inputConnector(input.filter(filter)
          .map((file) => {
            if (file.map) {
              // eslint-disable-next-line immutable/no-mutation
              file.map.sourceRoot = extendPath(file.map.sourceRoot, depth);
            } else {
              const sourceMap = getSourceMapFromSource(file.data, true);

              if (sourceMap) {
                // eslint-disable-next-line max-len
                sourceMap.setProperty('sourceRoot', extendPath(sourceMap.getProperty('sourceRoot'), depth));
                // eslint-disable-next-line immutable/no-mutation
                file.data = `${removeComments(file.data)}\n${sourceMap.toComment()}`;
              }
            }

            return file;
          })),
        ...dirs[dir]()
      ]);

      return tasks;
    }, []);
};

const splitCon = (input, dirs) => function splitConcurrent(log, reporter) {
  const start = Start(reporter);

  return start(concurrent(
    ...split(input, dirs, (tasks, subtasks) => tasks.push(() => start(...subtasks)), log)
  ));
};

const splitSeq = (input, dirs) => function splitSequential(log, reporter) {
  return Start(reporter)(
    ...split(input, dirs, (tasks, subtasks) => tasks.push(...subtasks), log)
  );
};

export default (dirs, concurr = true) => (input) => {
  if (!input) {
    return () => Promise.reject(new Error('no input to split'));
  }

  // eslint-disable-next-line no-ternary
  return concurr ? splitCon(input, dirs) : splitSeq(input, dirs);
};
