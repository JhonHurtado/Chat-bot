from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class FeedbackRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    question: str = Field(..., min_length=2)
    answer: str = Field(..., min_length=1)
    is_helpful: bool = Field(...)
    comments: Optional[str] = Field(None)