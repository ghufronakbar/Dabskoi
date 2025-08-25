import { Response } from "express";

export class BaseController {
  protected sendSuccess(
    res: Response,
    data: any,
    message = "Success",
    code = 200
  ) {
    return res
      .status(code)
      .json({ metaData: this.metaData(code), responseMessage: message, data });
  }

  public metaData(code: number) {
    let message = "OK";
    switch (code) {
      case 200:
        message = "OK";
        break;
      case 201:
        message = "Created";
        break;
      case 204:
        message = "No Content";
        break;
      case 400:
        message = "Bad Request";
        break;
      case 401:
        message = "Unauthorized";
        break;
      case 403:
        message = "Forbidden";
        break;
      case 404:
        message = "Not Found";
        break;
      case 500:
        message = "Internal Server Error";
        break;
      default:
        break;
    }
    return {
      code,
      message,
    };
  }

  protected sendCreated(res: Response, data: any, message = "Created") {
    return res
      .status(201)
      .json({ metaData: this.metaData(201), responseMessage: message, data });
  }

  protected sendError(res: Response, error: Error, code = 500) {
    const message = error?.message || "Internal server error";
    if (error.message?.includes("found")) {
      return this.notFound(res);
    }
    if (code === 500) {
      console.error("ERROR : ", message);
    }
    return res
      .status(code)
      .json({ metaData: this.metaData(code), responseMessage: message });
  }

  protected notFound(res: Response, message = "Tidak ada data yang ditemukan") {
    return res
      .status(404)
      .json({ metaData: this.metaData(404), responseMessage: message });
  }

  protected badRequest(res: Response, message = "Bad Request") {
    return res
      .status(400)
      .json({ metaData: this.metaData(400), responseMessage: message });
  }

  protected unauthorized(res: Response, message = "Unauthorized") {
    return res
      .status(401)
      .json({ metaData: this.metaData(401), responseMessage: message });
  }

  protected forbidden(res: Response, message = "Forbidden") {
    return res
      .status(403)
      .json({ metaData: this.metaData(403), responseMessage: message });
  }

  protected redirect(res: Response, url: string) {
    return res.redirect(url);
  }
}
