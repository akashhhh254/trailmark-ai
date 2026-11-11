"""FastAPI application for Trailmark."""
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, PlainTextResponse
from .config import settings
from .db import init_db

app = FastAPI(title="Trailmark", description="AI-powered project handover application")

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/healthz")
def healthz():
    return {"status": "ok", "app": settings.APP_NAME}

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "error": "Resource Not Found (404)",
            "details": "The requested handover case or share link does not exist.",
            "next_step": "Return to the homepage and select or create a project case."
        }
    )

@app.exception_handler(413)
async def payload_too_large_handler(request: Request, exc):
    return JSONResponse(
        status_code=413,
        content={
            "error": "Payload Too Large (413)",
            "details": "Uploaded files exceed the maximum allowed size limit.",
            "next_step": "Split your files or reduce content under 5MB."
        }
    )

@app.exception_handler(429)
async def rate_limit_handler(request: Request, exc):
    return JSONResponse(
        status_code=429,
        content={
            "error": "Rate Limit Exceeded (429)",
            "details": "Too many requests. Please wait a few moments.",
            "next_step": "Retry your extraction after 60 seconds."
        }
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error (500)",
            "details": "The server encountered an error processing your handover data.",
            "next_step": "Please refresh the page or try the synthetic sample project."
        }
    )
