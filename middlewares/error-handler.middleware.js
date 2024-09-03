import { Error } from "mongoose";

export default (err, req, res, next) => {
     console.log("에러처리 미들웨어 발생");
     console.error(err);
     if (err.name === "ValidationError") {
          return res.status(400).json({ errorMessage: err.message });
     }
     return res
          .status(500)
          .json({ errorMessage: " 서버에서 에러가 발생했습니다. " });
};
