# Admin Auth Middleware

- Use `authenticateAdmin()` middleware in routes that needs authorization.

```ts
    //example
    router.post("/course", authenticateAdmin, createCourse)
```
- To get admin data after authorization/authentication use `res.locals.admin`

```ts
    //example
    const createCourse: Controller = async(req, res) => {
        const currentAdmin = res.locals.admin //Type of admin is TAdmin
        ...
        ...
    }
```

