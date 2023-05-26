# Functions

## Legacy Functions
- `fulldatabase` — Returns full list of resources, categories, and counties
- `feedback` — Accepts feedback from mobile application users
- `uniqueid` — Returns a unique integer ID for the given unit (resource, category, or county)

## Searching Functions
Both search functions require `user` role for the authenticated user.
- `searchCategories` — Returns a list of ranked categories that match the search terms given
- `searchResource` — Returns a list of ranked resources that match the search terms given

## Entity Write Functions
All of these functions require the `user` role for the authenticated user.
- `postResource` — Creates a new resource. Returns the newly created key.
- `putResource` — Modifies the resource at the given resource key. Returns updated resource.
- `deleteResource` — Deletes the resource at the given key.
- `postCategory` — Creates a new category. Returns newly created key.
- `putCategory` — Modifies the category at the given key. Returns updated category.
- `deleteCategory` — Deletes category at the given key.

## Data Normalization Functions
All of these functions require the `admin` role for the authenticated user.
- `generateLowerCaseNames` — Updates `name_lower` for every category and resource to the lowercase value of their
  `name` property.
- `titleindex` — Updates the entire `search` object in the Realtime Database, which stores the word index of titles of
  resources and categories.
- `indexCategories` — Adds every resource key to every category to which the resource is linked.
- `addKeys` — Adds category and county keys to each resource based on their legacy integer ID.

# User Roles
- `user` — Update, create, or delete resources and categories.
- `admin` — Add new users, delete users, reset passwords.

User data shape looks like this:

```json
{
  "users": {
    "{user key}": ["user"],
    "{admin key}": ["user", "admin"]
  }
}
```

New users have to be given a role by an admin to be allowed to log into the system, because with the API key anyone can
create a new account.

Each role has mutually exclusive capabilities. For a user to be an admin, they have to have both the `user` role and the
`admin` role.

# Validators
The four entity write functions that accept the full entity as input (rather than just the key) are run through a 
validator. These functions are `postResource`, `putResource`, `postCategory`, and `putCategory`. When the given object
fails the validation check, the callable function throws an `invalid-argument` error and the request responds with the
appropriate HTTP code.

The validation system consists of the validation object, and the validate function. We pass the user input object in 
to the validate function with the validation object. All allowed keys are present in the validation object. Each key
has a `required` flag. If the key is not present in the user object but is marked required in the validation object,
validation will fail. Each key also has its own validate method. You can check for a non empty string, a specific 
JavaScript type, or run another object validation. If there are any keys present in the user object that are not present
in the validation object, the validation fails.
