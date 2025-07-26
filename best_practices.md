# 🧠 GitHub Best Practices

This guide outlines best practices for using GitHub effectively across branches, commits, and collaboration.

---

## 📁 Branch Naming Convention

Always create a new branch from the latest `main`.

### ✅ Prefix Types:

| Prefix         | Usage Example                |
|----------------|------------------------------|
| `feature/`     | `feature/user-auth`          |
| `bugfix/`      | `bugfix/pfp-upload-error`    |
| `hotfix/`      | `hotfix/login-crash`         |
| `refactor/`    | `refactor/image-service`     |
| `chore/`       | `chore/update-readme`        |
| `test/`        | `test/user-service-tests`    |

> ✨ Keep branch names lowercase, hyphen-separated, and clear.

---

## ✅ Commit Message Guidelines

Use meaningful commit messages to describe what you did **and why**.


### ✅ Types:

- `feat`: A new feature
- `fix`: A bug fix
- `refactor`: Code change that doesn't add or fix features
- `chore`: Minor changes (e.g. dependencies, formatting)
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `perf`: Performance improvement

### 🧠 Example:

```bash
git commit -m "fix: handle invalid image error in pfp upload"
```


# API & Code Best Practices Documentation

## 📁 Project Structure


### Backend
- #### File naming conventions
    - Use filename.<file type>.ts
    - eg: auth.controller.ts, student.route.ts
-  #### Structure
   - `controllers/`: Contains all route logic (e.g., `signupStudent`)
   - `routes/`: Keeps route files organized by domain
   - `lib/`: Contains custom libraries and utilities
   - `middleware/`: Contains all middlewares
   - `models/`: Contains databse models

### Frontend (React Native)
- `app/`: Should contain screens and navigators (Stack, Tab  etc...)
- `components/`: Contains components that are mostly reusable
- `types/`: For declaring types
- `api/`: API services functions are contained here
- `stores/`: Zustand states and stores are handled here

### Shared
Shared folder contains shared typescript types for both frontend and backend.
To use shared forlder in files. Import from ``` "@shared/<model, api, general etc>" ```
- #### Structure
    - `model/`: For declaring types for database models. 
    - `api/`: For declaring request and response types of api.
    - `general/`: For general types like gender, general api response etc.

---

## Usage Examples 

### For Models

- Creating a student model interface in `shared/models/students/Student.ts`

```ts
// shared/models/students/Student.ts
export interface TStudent<T=string>{
    _id: T;
    full_name: string;
    grade: number;
    phone_number: string;
    password: string;
    address: {
        province: string;
        district: string;
        institution: string
    }
}

export interface TStudentWithNoSensitive extends Omit<TStudent, "password"> {}
```

- Using student model interface in backend `backend/src/models/students/Student.model.ts`
```ts 
import mongoose, { model, Schema } from "mongoose";
import { TStudent } from "@shared/model/students/Student"

const schema = new Schema<TStudent<mongoose.Types.ObjectId>>({
    full_name: {
        type: String,
        required: true
    },
    grade: {
        type: Number,
        required: true,
    },
    phone_number: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        institution: {
            type: String,
            required: true
        },
        district: {
            type: String,
            required: true
        },
        province: {
            type: String,
            required: true
        }
    },
    password: {
        type: String,
        required: true
    }
}, {timestamps: true});
schema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});
export const Student = model("Student", schema);
```
### Api Controllers
- Use filename.controller.ts in controller folder
- Use `Controller` type for every controller functions
```ts
export const signUpStudent: Controller = async (req, res) => {
    ...
    ...
}
```
- Use `JsonResponse` class to handle standardized responses. ***You will learn about JsonResponse in next topic***
```ts 
export const signUpStudent: Controller = async (req, res) => {
const jsonResponse = new JsonResponse(res);
}
```
- Use `try catch` error for every controller
- Full example
```ts
//auth.controller.ts
export const signUpStudent: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);
    try {
        const body: SignupStudent.Req = req.body;
        const secret = process.env.SESSION_SECRET;
        const salt = await bcrypt.genSalt(10);
        const existingStudent = await Student.findOne({ phone_number: body.phone_number });
        if (existingStudent) {
            return jsonResponse.clientError("Phone number already registered");
        }
        if (!secret) throw new Error("No session secret provided");


        if (!body.full_name || body.full_name.trim().length < 3) {
            return jsonResponse.clientError("Full name is required and must be at least 3 characters");
        }

        if (!body.grade || typeof body.grade !== "number" || body.grade < 1 || body.grade > 12) {
            return jsonResponse.clientError("Grade must be a number between 1 and 12");
        }

        if (!body.phone_number || !/^[9][78]\d{8}$/.test(body.phone_number)) {
            return jsonResponse.clientError("Invalid phone number format");
        }

        if (!body.password || body.password.length < 6) {
            return jsonResponse.clientError("Password must be at least 6 characters long");
        }

        if (
            !body.address ||
            !body.address.province ||
            !body.address.district ||
            !body.address.institution
        ) {
            return jsonResponse.clientError("Complete address (province, district, institution) is required");
        }

        const encrypted_password = await bcrypt.hash(body.password, salt);

        const student = new Student({
            address: body.address,
            full_name: body.full_name,
            grade: body.grade,
            password: encrypted_password,
            phone_number: body.phone_number,
        });

        await student.save();
        const session: SessionPayload = {
            user_id: student._id.toString(),
            role: "student"
        }
        const token = jwt.sign(session, secret, {
            expiresIn: "10d"
        });

        res.cookie("session", token, options);
        const studentObj = student.toJSON();
        jsonResponse.success(studentObj);
    } catch (error) {
        console.error(error);
        jsonResponse.serverError();
    }
};

```
## `JsonResponse` class
Json Response class is a helper class to standardize api responses.
- Standrd Api Response:
```ts

export interface ApiResponse<T = {}> {
  result: T; //Main data server sending example, Student Document, Courses etc.
  error: boolean; //true if there is any api error
  status: number; //standard api status
  message: string; //success or error messages
}
```
- Class:
```ts
import { Response } from "express";

export default class JsonResponse {
    constructor(private res: Response){}
    
    public success(result: any = {}, message: string = "success"){
        this.res.status(200).json({
            error: false,
            status: 200,
            result,
            message
        })
    }
    public serverError(message: string = "Internal Server Error", result: any = null){
        this.res.status(200).json({
            error: true,
            status: 500,
            result,
            message
        })
    }
    public notFound(message: string){
        this.res.status(200).json({
            error: true,
            status: 404,
            result: null,
            message
        })
    }
    public notAuthorized(message: string = "Not authorized"){
        this.res.status(200).json({
            error: true,
            status: 401,
            result: null,
            message
        })
    }
    public clientError(message: string, result: any = null){
        this.res.status(200).json({
            error: true,
            status: 400,
            result,
            message
        })
    }
}
```
- ### Methods:
    - `jsonResponse.clientError(message: string, result?: any)`: Used if there is any client caused error like, validation errors.
    - `jsonResponse.success(result: any = {}, message: string = "success")`: Used if there is no error and succesful api request
    - `jsonResponse.notAuthorized(message: string = "Not authorized")`: Used when user is not authorized or authenticated
    - `jsonResponse.serverError(message: string = "Internal Server Error", result: any = null)`: Used when there is server side error like, type errors or config errors etc.
    - `jsonResponse.notFound(message: string)`: Used if data is not found

### Request And Response Namespace

The Request and Response namespaces are used in a TypeScript-based backend (commonly with Express) to define custom types or interfaces for:

1) Request bodies, query parameters, route params, etc.

2) Structured response objects that your API returns.

These help ensure type safety and auto-completion in your backend code and any frontend consuming it.
### ✅ How to Define Request and Response Namespaces

1) Define a namespace with suitable name
2) Each namespace should have interfaces: `Req`, `Res`, `ApiRes`
3) `Req`: Used for defining data that are sent by clients
4) `Res`: Used for defining `result` for Api Response
5) `ApiRes`: Used for defining final ApiResponse in Standard form with (error, result, message, status)
`ApiRes` will look like
```ts
{
    error: boolean,
    message: string,
    status: number,
    result: {
        user: TStudentWithNoSensitive & {
            avatarEmoji:boolean
        }
        token: string
    }
}
```
`shared/api/student/auth.ts`
```ts
export namespace SignupStudent {
    export interface Req {
        full_name: string;
        grade: number;
        phone_number: string;
        password: string;
        address: {
            province?: string;
            district?: string;
            institution?: string
        }
    }
    interface Res {
        user: TStudentWithNoSensitive & {
            avatarEmoji:boolean
        }
        token: string
    }
    export type ApiRes = ApiResponse<Res>;
}
```
### Usage of Api type namespace
`server side`
```ts
//importing from shared
import { SignupStudent } from "@shared/api/student/auth"
export const signUpStudent: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);
    ....
    const body: SignupStudent.Req = req.body;
    //now contains all client sent data
    if (!body.full_name || body.full_name.trim().length < 3) {
        return jsonResponse.clientError("Full name is required and must be at least 3 characters");
    }
    .....
    .....
    const studentObj = student.toJSON() as any; 
    //setting up response for interface `Res`
    const response: SignupStudent.Res = {
        user: studentObj,
        oken
    }
    jsonResponse.success(response);     //This automatically converts to `Res to ApiRes`
}
```
`client side`
```ts
// Importing namespace
import { SignupStudent } from "@shared/api/student/auth";
//parameter of this function is used as  SignupStudent.Req and sent to backend
export const createStudent = async(data: SignupStudent.Req) => {
    const res = await api.post("/student/auth/signup", data);
    //the function returns Signup Student Api Response type
    //It contains standard Api Response {error, message, result, status}
    return res.data as SignupStudent.ApiRes;
}
```
## 🔐 Auth & Tokens
Will update soon


## 📦 File Upload
Will update soon

#✅ Follow these standards to maintain scalable, secure, and readable code.