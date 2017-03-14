const Util = require('../util');

describe('toResult', () => {
  test('should return a Result object', () => {
    const result = Util.toResult(true, 'message');

    expect(result).toEqual({
      status: true,
      messages: ['message']
    });
  });

  test('should default to empty messages', () => {
    const result = Util.toResult(false);

    expect(result).toEqual({
      status: false,
      messages: []
    });
  });
});

describe('joinErrors', () => {
  test('should return a string with all messages joined', () => {
    const errors = ['nope', 'bad', 'try again'];

    expect(Util.joinErrors).toMatchSnapshot();
  });
});

describe('combineResults', () => {
  test('should combine two results into a single result', () => {
    const result = Util.combineResults(
      {
        messages: [],
        status: true
      },
      {
        messages: [],
        status: true
      }
    );

    expect(result).toEqual({
      status: true,
      messages: []
    });
  });

  test('if one fails, they result fails', () => {
    const result = Util.combineResults(
      {
        messages: ['nope'],
        status: false
      },
      {
        messages: [],
        status: true
      }
    );

    expect(result).toEqual({
      status: false,
      messages: ['nope']
    });
  });

  test('should combine messages', () => {
    const result = Util.combineResults(
      {
        messages: ['nope'],
        status: false
      },
      {
        messages: ['nah'],
        status: false
      }
    );

    expect(result).toEqual({
      status: false,
      messages: ['nope', 'nah']
    });
  });
});
