# Product

<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
static HTML/CSS with Python/FastAPI backend

## Users
University professors/instructors who create exams, upload rubrics, and grade student submissions using automated AI/OCR grading

## Product Purpose
An web-based exam grading system that uses AI and OCR technology to automatically grade student submissions based on instructor-provided rubrics, eliminating manual grading while ensuring consistent, scalable assessment processing

## Positioning
Provides end-to-end automated exam grading with AI/OCR that neighboring products cannot truthfully copy - combining rubric-based consistency with intelligent text extraction for subjective assessments

## Operating Context
University/academic environment where instructors create digital exams, upload PDF rubrics, receive student PDF/image submissions, and need efficient, consistent grading workflows that integrate with existing Learning Management Systems

## Capabilities and Constraints
- AI-powered OCR for extracting text from student submissions
- Rubric-based grading with configurable criteria and point allocation
- Support for PDF and image file formats for both rubrics and student answers
- Background processing tracking for OCR tasks
- RESTful API backend with SQLAlchemy ORM and PostgreSQL/MySQL compatibility
- Structured data storage for AI-generated rubrics and extracted student answers
- Constraint: Requires clear, legible handwriting or typed responses for accurate OCR
- Constraint: AI accuracy depends on rubric clarity and question specificity

## Brand Commitments
Clean, simple, soft, and nice-to-look-at interface design as requested by the university lecturer stakeholder

## Evidence on Hand
Existing FastAPI backend with database models for exams, questions, rubrics, and student answers
OCR processing pipeline with status tracking (UPLOADED, PROCESSING, READY, FAILED)
JSON-based storage for AI-structured data from both rubrics and student answers

## Product Principles
1. Instructor-centered design: Prioritize educator workflow and reduce grading cognitive load
2. AI-assisted, human-reviewed: Automate extraction and initial scoring while maintaining instructor oversight
3. Consistent application: Ensure rubrics are applied uniformly across all submissions
4. Transparent processing: Provide clear status tracking and audit trails for all grading operations
5. Accessible simplicity: Maintain clean, soft visual design that reduces user stress during intensive grading periods

## Accessibility & Inclusion
Support for screen readers and keyboard navigation to accommodate diverse instructor needs
Color contrast ratios meeting WCAG AA standards for readability
Flexible input methods supporting various document formats and qualities