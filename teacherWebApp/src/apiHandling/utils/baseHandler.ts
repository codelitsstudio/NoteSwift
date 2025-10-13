import { NextRequest, NextResponse } from 'next/server';

// Base response interface (matches backend JsonResponse structure)
export interface ApiResponse<T = any> {
  error: boolean;
  message: string;
  result?: T;
  status: number;
  timestamp?: string;
}

// Request handler type
export type ApiHandler = (req: NextRequest) => Promise<NextResponse>;

// Base API handler class (mirrors backend controller structure)
export class BaseApiHandler {
  protected success<T>(data: T, message = 'Success'): NextResponse {
    const response: ApiResponse<T> = {
      error: false,
      message,
      result: data,
      status: 200,
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, { status: 200 });
  }

  protected created<T>(data: T, message = 'Created successfully'): NextResponse {
    const response: ApiResponse<T> = {
      error: false,
      message,
      result: data,
      status: 201,
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, { status: 201 });
  }

  protected clientError(message = 'Bad request', status = 400): NextResponse {
    const response: ApiResponse = {
      error: true,
      message,
      status,
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, { status });
  }

  protected unauthorized(message = 'Unauthorized'): NextResponse {
    const response: ApiResponse = {
      error: true,
      message,
      status: 401,
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, { status: 401 });
  }

  protected forbidden(message = 'Forbidden'): NextResponse {
    const response: ApiResponse = {
      error: true,
      message,
      status: 403,
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, { status: 403 });
  }

  protected notFound(message = 'Not found'): NextResponse {
    const response: ApiResponse = {
      error: true,
      message,
      status: 404,
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, { status: 404 });
  }

  protected serverError(message = 'Internal server error'): NextResponse {
    const response: ApiResponse = {
      error: true,
      message,
      status: 500,
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, { status: 500 });
  }

  // Common error handler
  protected handleError(error: any): NextResponse {
    console.error('API Error:', error);
    
    if (error.name === 'ValidationError') {
      return this.clientError(`Validation error: ${error.message}`);
    }
    
    if (error.name === 'CastError') {
      return this.clientError('Invalid ID format');
    }
    
    if (error.code === 11000) {
      return this.clientError('Duplicate entry. Resource already exists');
    }
    
    return this.serverError(error.message || 'Something went wrong');
  }

  // Parse request body
  protected async parseBody(req: NextRequest): Promise<any> {
    try {
      return await req.json();
    } catch {
      throw new Error('Invalid JSON in request body');
    }
  }

  // Get query parameters
  protected getQuery(req: NextRequest): URLSearchParams {
    return new URL(req.url).searchParams;
  }

  // Get path parameters
  protected getPathParams(req: NextRequest, pathPattern: string): Record<string, string> {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const patternSegments = pathPattern.split('/').filter(Boolean);
    
    const params: Record<string, string> = {};
    
    patternSegments.forEach((segment, index) => {
      if (segment.startsWith('[') && segment.endsWith(']')) {
        const paramName = segment.slice(1, -1);
        params[paramName] = pathSegments[index] || '';
      }
    });
    
    return params;
  }

  // Validate required fields
  protected validateRequired(data: Record<string, any>, fields: string[]): void {
    const missingFields = fields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  // Validate teacher authentication (placeholder - implement based on your auth system)
  protected async validateTeacher(req: NextRequest): Promise<any> {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Authorization token required');
    }
    const token = authHeader.replace('Bearer ', '').trim();
    try {
      // Decode base64 token
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      // Validate decoded token structure
      if (!decoded.id) {
        throw new Error('Invalid token: missing teacher id');
      }
      return decoded;
    } catch (err) {
      throw new Error('Invalid token format');
    }
  }

  // Validate admin token and ensure admin exists in DB
  
}