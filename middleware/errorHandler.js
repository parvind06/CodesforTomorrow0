const getErrorDetails = (err, defaultCode) => {
  const code = err?.status || defaultCode;
  const message = err?.message || "An error occurred";
  return { code, message };
};

module.exports = {
  handleError: (err, req, res, next) => {
    console.error("Error:", err.message);
    const statusCode = err.status || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
      status: "error",
      statusCode,
      message,
    });
  },

  success: (res, message = "", body = {}, code = 200) => {
    res.status(code).json({
      success: true,
      code,
      message,
      data: body,
    });
  },

  permission: (res, err, body = {}) => {
    const { code, message } = getErrorDetails(err, 403);
    res.status(code).json({
      success: false,
      code,
      message,
      body,
    });
  },

  error: (res, err, body = {}) => {
    const { code, message } = getErrorDetails(err, 500);
    res.status(code).json({
      success: false,
      code,
      message,
      data: body,
    });
  },

  invalidRequest: (res, body = {}) => {
    res.status(400).json({
      success: false,
      code: 400,
      message: "Invalid Request",
      body,
    });
  },

  notFound: (res, message = "Resource Not Found", body = {}) => {
    res.status(404).json({
      success: false,
      code: 404,
      message,
      body,
    });
  },

  created: (res, message = "Resource Created", body = {}) => {
    res.status(201).json({
      success: true,
      code: 201,
      message,
      data: body,
    });
  },
};
