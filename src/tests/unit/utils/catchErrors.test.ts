import { describe, it, expect, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import { catchErrors } from "../../../utils/catchErrors";

describe("utils - catchErrors", () => {
  // Mock Express req, res, next
  const mockReq = {} as Request;
  const mockRes = {} as Response;
  const mockNext = vi.fn() as NextFunction;

  it("should successfully execute controller function", async () => {
    // Mock successful controller
    const mockController = vi.fn().mockResolvedValue({ success: true });
    const wrappedController = catchErrors(mockController);

    const result = await wrappedController(mockReq, mockRes, mockNext);

    expect(result).toEqual({ success: true });
    expect(mockController).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should call next with error when controller throws", async () => {
    const testError = new Error("Test error");
    const mockController = vi.fn().mockRejectedValue(testError);
    const wrappedController = catchErrors(mockController);

    await wrappedController(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(testError);
  });
});
