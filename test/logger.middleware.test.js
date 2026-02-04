const { requestLogger } = require("../src/middlewares/logger.middleware");
const { logger } = require("../src/utils");

// Mock the logger utility so we can spy on its methods
jest.mock("../src/utils", () => ({
  logger: {
    info: jest.fn(),
  },
}));

describe("Logger Middleware", () => {
  let req;
  let res;
  let next;
  let finishCallback;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock the request object
    req = {
      method: "GET",
      originalUrl: "/test-url",
    };

    // Mock the response object, capturing the 'finish' event callback
    res = {
      on: jest.fn((event, callback) => {
        if (event === "finish") {
          finishCallback = callback;
        }
      }),
      statusCode: 200,
    };

    // Mock the next function
    next = jest.fn();
  });

  it("should call next() to pass control to the next middleware", () => {
    requestLogger(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should register a 'finish' event listener on the response object", () => {
    requestLogger(req, res, next);
    expect(res.on).toHaveBeenCalledWith("finish", expect.any(Function));
  });

  it("should log the correct message when the response 'finish' event is triggered", () => {
    // Use fake timers to get a predictable duration
    jest.useFakeTimers();

    requestLogger(req, res, next);

    // Simulate 123ms passing before the response finishes
    jest.advanceTimersByTime(123);
    res.statusCode = 201; // We can even simulate the status code changing

    // Manually trigger the captured 'finish' callback
    finishCallback();

    // Assert that our logger was called correctly
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith("GET /test-url 201 123ms");

    // Restore real timers
    jest.useRealTimers();
  });
});
