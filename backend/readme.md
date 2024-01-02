# CSC309 P2 Documentation
This document organizes the endpoints by the respective pages that each endpoint will be used for.

## Table of Contents (unfortunately none of these links are clickable)
* [createunit.html](#createunithtml)
  * [Endpoint: /properties/create/](#endpoint--propertiescreate)
  * [Endpoint: /properties/{id}/unavailable/add/](#endpoint--propertiesidunavailableadd)
  * [Endpoint: /properties/{id}/price_adjustment/add/](#endpoint--propertiesidpriceadjustmentadd)
  * [Endpoint: /properties/{id}/images/add/](#endpoint--propertiesidimagesadd)
* [editprofile.html](#editprofilehtml)
  * [Endpoint: /accounts/update/](#endpoint--accountsupdate)
* [editunit.html](#editunithtml)
  * [Endpoint: /properties/{id}/delete/](#endpoint--propertiesiddelete)
  * [Endpoint: /properties/{id}/update/](#endpoint--propertiesidupdate)
  * [Endpoint: /properties/{property_id}/price_adjustment/delete/{id}/](#endpoint--propertiespropertyidpriceadjustmentdeleteid)
  * [Endpoint: /properties/{property_id}/unavailable/delete/{id}/](#endpoint--propertiespropertyidunavailabledeleteid)
  * [Endpoint: /properties/{property_id}/images/delete/{id}](#endpoint--propertiespropertyidimagesdeleteid)
* [index.html](#indexhtml)
  * [Endpoint: /properties/all/](#endpoint--propertiesall)
* [login.html](#loginhtml)
  * [Endpoint: /accounts/api/token/](#endpoint--accountsapitoken)
  * [Endpoint: /accounts/api/token/refresh/](#endpoint--accountsapitokenrefresh)
* [myunits.html](#myunitshtml)
  * [Endpoint: /accounts/{id}/properties/view](#endpoint--accountsidpropertiesview)
* [notifications.html](#notificationshtml)
  * [Endpoint: /notifications/{id}/view/](#endpoint--notificationsidview)
  * [Endpoint: /notifications/view/](#endpoint--notificationsview)
  * [Endpoint: /notifications/markallread/](#endpoint--notificationsmarkallread)
  * [Endpoint: /notifications/{id}/delete/](#endpoint--notificationsiddelete)
* [profile.html](#profilehtml)
  * [Endpoint: /accounts/id/view/](#endpoint--accountsidview)
* [register.html](#registerhtml)
  * [Endpoint: /accounts/register/](#endpoint--accountsregister)
* [requests.html](#requestshtml)
  * [Endpoint: /requests/{id}/cancel/](#endpoint--requestsidcancel)
  * [Endpoint: /requests/{id}/view/](#endpoint--requestsidview)
  * [Endpoint: /requests/tocancel/{id}/update/](#endpoint--requeststocancelidupdate)
  * [Endpoint: /requests/toproperty/{id}/update/](#endpoint--requeststopropertyidupdate)
  * [Endpoint: /requests/view/](#endpoint--requestsview)
* [units.html](#unitshtml)
  * [Endpoint: /properties/{id}/view/](#endpoint--propertiesidview)
  * [Endpoint: /properties/{id}/request/](#endpoint--propertiesidrequest)
* [Schema](#schema)
* [Dataset](#dataset)
    * [Created User 1](#created-user-1)
    * [Created User 2](#created-user-2)
  * [Created User 3](#created-user-3)
    * [Created Property 1](#created-property-1)
    * [Property Request 1: Jane Smith requesting John Doe's property](#property-request-1--jane-smith-requesting-john-does-property)
    * [Property Request 1: Jane Smith requesting John Doe's property](#property-request-1--jane-smith-requesting-john-does-property-1)

## createunit.html
### Endpoint: /properties/create/
Description: Creates a property \
Methods: POST \
Request Body: title, base_price, longitude, latitude, address, bedrooms, bathrooms, guest_limit \
Example Response:
```
{
    "id": 1,
    "host": 1,
    "title": "Definitely not Robarts",
    "base_price": 800,
    "longitude": "-79.3994500124",
    "latitude": "43.6645625368",
    "address": "130 St. George St., Toronto, ON",
    "rating": "0.0",
    "bedrooms": 2,
    "distance": null,
    "bathrooms": 2,
    "guest_limit": 4,
    "propertyimage_set": [],
    "unavailable_set": [],
    "priceadjustment_set": []
}
```

Additional Notes:
- Method requires user to be authenticated
- All fields in request body are required.

### Endpoint: /properties/{id}/unavailable/add/
Description: Adds an unavailable period to a property (due to a reservation or due to host blocking off time.)\
Methods: POST \
Request Body: start_date, end_date\
Example Response:
```
{
    "id": 2,
    "start_date": "2022-07-24",
    "end_date": "2022-07-28",
    "is_reservation": false,
    "request": null
}
```
Validation details: (Default validation from model declaration is omitted)
- Start date must be less than end_date
- Requested unavailable range must not overlap with any existing unavailable ranges.
- Logged-in user must be host of property.

Additional Notes:
- Returns 404 if property with corresponding id cannot be found
- Method requires user to be authenticated
- All fields in request body are required.

### Endpoint: /properties/{id}/price_adjustment/add/
Description: Adds a temporary price adjustment to property\
Methods: POST \
Request Body: start_date, end_date, price_per_night \
Example Response:
```
{
    "id": 1,
    "start_date": "2023-10-01",
    "end_date": "2023-10-30",
    "price_per_night": "1000.00"
}
```
Validation details: (Default validation from model declaration is omitted)
- Start date must be less than end_date
- Requested price adjustment range must not overlap with any existing price adjustment ranges.
- Logged-in user must be host of property.

Additional Notes:
- Returns 404 if property with corresponding id cannot be found
- Method requires user to be authenticated
- All fields in request body are required.

### Endpoint: /properties/{id}/images/add/ 
Description: Adds image to property \
Methods: POST \
Fields/payload: image \
Example Response:
```
{
    "id": 1,
    "image": "http://localhost:8000/media/images/dog.jpg"
}
```
Validation details: (Default validation from model declaration is omitted)
- Logged-in user must be host of property.

Additional notes:
- Method requires user to be authenticated
- All fields in request body are required.
- Returns 404 if property with corresponding id cannot be found
- To upload an image, set body to form-data.

## editprofile.html

### Endpoint: /accounts/update/
Description: Updates account data \
Methods: PATCH \
Fields/payload: first_name, last_name, password, password2, email, phone_number, avatar\
Example Response:
```
{
    "data": {
        "id": 1,
        "username": "JohnDoe",
        "email": "first@example.com",
        "first_name": "First",
        "last_name": "Last",
        "phone_number": "1234567890",
        "is_host": true,
        "avatar": "/media/images/image.png"
    }
}
```

Additional Notes:
- Method requires user to be authenticated
- To upload an avatar, set body to form-data.

## editunit.html
Note that this page uses the same add unavailability, price adjustment, and image endpoints as CreateUnit

### Endpoint: /properties/{id}/delete/
Description: Deletes property.\
Methods: DELETE \
Fields/payload: None\
Example Response:
```
HTTP 204 No Content
```
Validation details: (Default validation from model declaration is omitted)
- Logged-in user must be host of property.

Additional Notes:
- If all of a hosts properties are deleted the host's status reverts to a regular user
- Method requires user to be authenticated
- Returns 404 if property with corresponding id cannot be found
- Method terminates any approved requests and sends the user a corresponding notification.
- Method denies any open requests and sends out a notification.

### Endpoint: /properties/{id}/update/
Description: Updates property info \
Methods: PUT, PATCH\
Fields/payload: address, base_price, bathrooms, bedrooms, guest_limit, latitude, longitude, title\
Example Response:
```
{
    "id": 1,
    "host": 1,
    "title": "Definitely not Robarts",
    "base_price": 1800,
    "longitude": "-79.3994500124",
    "latitude": "43.6645625368",
    "address": "89 Chestnut St.",
    "rating": "0.0",
    "bedrooms": 2,
    "distance": null,
    "bathrooms": 1,
    "guest_limit": 2,
    "propertyimage_set": [...],
    "unavailable_set": [...],
    "priceadjustment_set": [...]
}
```
Validation details: (Default validation from model declaration is omitted)
- Logged-in user must be host of property.

Additional Notes:
- Method requires user to be authenticated
- Returns 404 if property with corresponding id cannot be found
- Method requires user to be authenticated
- PUT requires all fields in request body.
- PATCH does not require all fields in request body.

### Endpoint: /properties/{property_id}/price_adjustment/delete/{id}/
Description: Deletes a temporary price adjustment from property\
Methods: DELETE\
Fields/payload: None\
Example Response:
```
HTTP 204 No Content
```
Validation details: (Default validation from model declaration is omitted)
- Returns 403 if property id from path parameters is not the associated property id for the price adjustment.
- Logged-in user must be host of property.

Additional Notes:
- Method requires user to be authenticated
- Returns 404 if price adjustment with corresponding id cannot be found.

### Endpoint: /properties/{property_id}/unavailable/delete/{id}/
Description: Deletes an unavailable time slot from property.\
Methods: DELETE \
Fields/payload: None\
Example Response:
```
HTTP 204 No Content
```
Validation details: (Default validation from model declaration is omitted)
- Returns 403 if property id from path parameters is not the associated property id for the unavailable time slot.
- Logged-in user must be host of property.

Additional Notes:
- Method requires user to be authenticated
- Returns 404 if price adjustment with corresponding id cannot be found.
- If the unavailable time slot is due to a request, method terminates it if approved or denies it if pending and sends the user a corresponding notification.

### Endpoint: /properties/{property_id}/images/delete/{id}
Description: Deletes a certain image from a property\
Methods: DELETE\
Fields/payload: None\
Example Response:
```
HTTP 204 No Content
```
Validation details: (Default validation from model declaration is omitted)
- Returns 403 if property id from path parameters is not the associated property id for the image.
- Logged-in user must be host of property.

Additional Notes:
- Method requires user to be authenticated
- Returns 404 if the image with corresponding id cannot be found
- Image should also be deleted from disk.

## index.html

### Endpoint: /properties/all/
Description: Retrieves all properties that match the selected filters. \
Methods: GET \
Query Parameters: page, check_in, check_out, min_price, max_price, sort_by, location, num_guests\
Example Response:
```
{
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "host": 1,
            "title": "Definitely not Robarts",
            "base_price": 800,
            "longitude": "-79.3994500124",
            "latitude": "43.6645625368",
            "address": "130 St. George St., Toronto, ON",
            "rating": "0.0",
            "bedrooms": 2,
            "distance": null,
            "bathrooms": 2,
            "guest_limit": 4,
            "propertyimage_set": [...],
            "unavailable_set": [...],
            "priceadjustment_set": [...]
        }
    ]
}
```
Validation details: (Default validation from model declaration is omitted)
- Location must be in the form of \<lat\>,\<long\>
- Check in date must be before check out date

Additional Notes:
- User does not need to be authenticated
- Results will exclude properties that are not available between the checkin and checkout dates if given
- If the user's location is provided, the method will calculate the distance between the user's location and each property.
- Valid sort options are distance, rating, price_highest, and price_lowest.
- Results are paginated.

## login.html

### Endpoint: /accounts/api/token/
Description: Login/Auth related page\
Methods: POST \
Fields/payload: username, password\
Example Response:
```
{
    "refresh": "<refresh token>",
    "access": "<access token>"
}
```

### Endpoint: /accounts/api/token/refresh/
Description: Login/Auth related page\
Methods: POST \
Fields/payload: username, password\
Example Response:
```
{
    "access": "<access token>"
}
```

## myunits.html

### Endpoint: /accounts/{id}/properties/view
Description: Gets list of properties belonging to the current logged-in user\
Methods: GET\
Query Parameters: page\
Example Response:
```
{
    "count": 2,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "host": 1,
            "title": "Definitely not Robarts",
            "base_price": 800,
            "longitude": "-79.3994500124",
            "latitude": "43.6645625368",
            "address": "130 St. George St., Toronto, ON",
            "rating": "0.0",
            "bedrooms": 2,
            "distance": null,
            "bathrooms": 2,
            "guest_limit": 4,
            "propertyimage_set": [...],
            "unavailable_set": [...],
            "priceadjustment_set": [...]
        },
        {
            "id": 2,
            "host": 1,
            "title": "Property 2",
            ...
        }
    ]
}
```
Validation details: (Default validation from model declaration is omitted)
- Returns 403 if path parameter id does not match the logged-in user's id.

Additional Notes:
- Results are paginated.
- Method requires user to be authenticated

## notifications.html
### Endpoint: /notifications/{id}/view/
Description: Gets a specific notification\
Methods: GET\
Fields/payload: None\
Example Response:
```
{
    "id": 1,
    "read_by_receiver": true,
    "notif_type": "request",
    "time_sent": "2023-03-19T03:53:18.246000Z",
    "data": {
        "host": 1
    },
    "sender": 2,
    "receiver": 1
}
```

Validation details: (Default validation from model declaration is omitted)
- Returns 403 if the current logged-in user is not the recipient of the message.

Additional Notes:
- Method requires user to be authenticated
- Notifications accessed via this endpoint will be marked as read.

### Endpoint: /notifications/view/
Description: Gets all notifications belonging to the logged-in user\
Methods: GET \
Fields/payload: page \
Example Response:
```
{
    "count": 2,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "read_by_receiver": false,
            "notif_type": "request",
            "time_sent": "2023-03-19T03:53:18.246000Z",
            "data": {
                "host": 1
            },
            "sender": 2,
            "receiver": 1
        },
        {
            "id": 2,
            "read_by_receiver": false,
            "notif_type": "request",
            "time_sent": "2023-03-19T04:37:50.261000Z",
            "data": {
                "host": 1
            },
            "sender": 2,
            "receiver": 1
        }
    ]
}
```

Additional Notes:
- Results are paginated.
- Method requires user to be authenticated

### Endpoint: /notifications/markallread/
Description: Marks all of the user's notifications as read\
Methods: PATCH \
Fields/payload: None\
Example Response:
```
{"data":"Marked successfully."}
```
Additional Notes:
- Method requires user to be authenticated

### Endpoint: /notifications/{id}/delete/
Description: Deletes a specific notification\
Methods: DELETE\
Fields/payload: None\
Example Response:
```
HTTP 204 No Content
```

Validation details: (Default validation from model declaration is omitted)
- Returns 403 if the current logged-in user is not the recipient of the message.

Additional Notes:
- Method requires user to be authenticated
- Returns 404 if notification cannot be found
- Returns 204 on success

## profile.html
### Endpoint: /accounts/id/view/
Description: Gets user info for view profile page\
Methods: GET \
Fields/payload: None\
Example Response:
```
{
    "id": 1,
    "username": "JohnDoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "1234567890",
    "is_host": true
}
```

## register.html


Signup page

### Endpoint: /accounts/register/
Description: Creates a new user\
Methods: POST \
Fields/payload: email, first_name, last_name, password, password2, phone_number, username\
Example Response:
```
{
    "id": 1,
    "username": "JohnDoe",
    "email": "john@example.com",
    "password": "<hashed password>",bkdf2_sha256$390000$WSe8m6kd45DcK5rCgxJYmh$ebEmS7iXf/J6t0Wh9Cjs+e6Auo+Rew+3V+8IcUh9gV4=
    "password2": "",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "1234567890"
}
```

Additional Notes:
- Users do not have to be authenticated
- All fields in request body are required.

## requests.html
### Endpoint: /requests/{id}/cancel/
Description: Creates a cancellation request for an approved reservation\
Methods: POST\
Fields/payload: None\
Example Response:
```
{
    "id": 1,
    "created": "2023-03-19T17:03:11.418621Z",
    "status": "pending",
    "type": "cancellation",
    "receiver": 1,
    "requester": 2,
    "request": 2
}
```
Validation details: (Default validation from model declaration is omitted)
- User cannot cancel a request they did not make.
- Request needs to be approved before it can be cancelled

Additional Notes:
- Method requires user to be authenticated
- Returns 404 if the associated request cannot be found

### Endpoint: /requests/{id}/view/
Description: Retrieves a specific request\
Methods: GET \
Query Parameters: type(cancellation/property)\
Example Response:
```
{
    "id": 1,
    "created": "2023-03-19T03:53:18.255000Z",
    "status": "pending",
    "type": "property",
    "start_date": "2023-05-04",
    "end_date": "2023-05-19",
    "expiry_date": "2023-04-29",
    "receiver": 1,
    "requester": 2,
    "property": 1
}
```
Validation details: (Default validation from model declaration is omitted)
- Only the requester or receiver can retrieve the request

Additional Notes:
- Updates any expired requests when they are retrieved.
- Method requires user to be authenticated.
- Returns 404 if the specific request cannot be found


### Endpoint: /requests/tocancel/{id}/update/
Description: Allows host to accept or deny a cancellation request\
Methods: PATCH\
Fields/payload: new_status (approved/denied) \
Example Response:
```
{
    "data": {
        "id": 2,
        "created": "2023-03-19T18:53:49.069221Z",
        "status": "approved",
        "type": "cancellation",
        "receiver": 1,
        "requester": 2,
        "request": 2
    }
}
```
Validation details: (Default validation from model declaration is omitted)
- User must be receiver of request (host of property)
- Request must be pending to be updated

Additional Notes:
- Method requires user to be authenticated.
- Returns 404 if the specific request cannot be found
- Sends out notification to requester about the status of their cancellation request upon success

### Endpoint: /requests/toproperty/{id}/update/
Description: Updates requests with a new status\
Methods: PATCH\
Fields/payload: new_status (approved/denied/terminated/cancelled)\
Example Response:
```
{
    "data": {
        "id": 1,
        "created": "2023-03-19T03:53:18.255000Z",
        "status": "approved",
        "type": "property",
        "start_date": "2023-05-04",
        "end_date": "2023-05-19",
        "expiry_date": "2023-04-29",
        "receiver": 1,
        "requester": 2,
        "property": 1
    }
}
```
Validation details: (Default validation from model declaration is omitted)
- User must be either the host of the property or the requester
- Users can only cancel pending requests
- Hosts can only approve, deny, or terrminate requests

Additional Notes:
- Method requires user to be authenticated.
- Returns 404 if the specific request cannot be found
- Returns 400 if new_status is invalid
- On termination the unavailable period associated with the request is deleted
- On cancellation the request is deleted.
- Sends out relevant notifications

### Endpoint: /requests/view/
Description: Retrieves the desired list of requests\
Methods: GET \
Query Parameters: received (true/false), type (cancellation/property)\
Example Response:
```
[
    {
        "id": 1,
        "created": "2023-03-19T03:53:18.255000Z",
        "status": "pending",
        "type": "property",
        "start_date": "2023-05-04",
        "end_date": "2023-05-19",
        "expiry_date": "2023-04-29",
        "receiver": 1,
        "requester": 2,
        "property": 1
    },
    {
        "id": 2,
        "created": "2023-03-19T04:37:50.269000Z",
        ...
    }
]
```
Validation details: (Default validation from model declaration is omitted)
- Will only retrieve requests that are sent/received by the user

Additional Notes:
- Updates any expired requests when they are retrieved.
- Method requires user to be authenticated
- Results are paginated.

## units.html
### Endpoint: /properties/{id}/view/
Description: Get a specific property\
Methods: GET \
Fields/payload: None \
Example Response:
```
{
    "id": 1,
    "host": 1,
    "title": "Definitely not Robarts",
    "base_price": 800,
    "longitude": "-79.3994500124",
    "latitude": "43.6645625368",
    "address": "130 St. George St., Toronto, ON",
    "rating": "0.0",
    "bedrooms": 2,
    "distance": null,
    "bathrooms": 2,
    "guest_limit": 4,
    "propertyimage_set": [...],
    "unavailable_set": [...],
    "priceadjustment_set": [...]
}
```

Additional Notes:
- Returns 404 if property cannot be found
- Method requires user to be authenticated
### Endpoint: /properties/{id}/request/
Description: Requests a property between a specific time range\
Methods: POST \
Fields/payload: start_date, end_date, expiry_date\
Example Response:
```
{
    "id": 3,
    "created": "2023-03-19T18:53:41.266901Z",
    "status": "pending",
    "type": "property",
    "start_date": "2023-01-03",
    "end_date": "2023-01-04",
    "expiry_date": "2022-12-05",
    "receiver": 1,
    "requester": 2,
    "property": 1
}
```
Validation details: (Default validation from model declaration is omitted)
- Hosts cannot request their own property
- New requests cannot overlap with existing requests by the same user and existing reservations by any user

Additional Notes:
- Returns 404 if property cannot be found
- Method requires user to be authenticated.

## Schema
![schema](diagram.png)

## Dataset

#### Created User 1
```
"id": 1,
"username": "JohnDoe",
"email": "john@example.com",
"password": "123",
"first_name": "John",
"last_name": "Doe",
"phone_number": "1234567890"
```

#### Created User 2
```
"id": 2,
"username": "JaneSmith",
"email": "jane@example.com",
"password": "123",
"first_name": "Jane",
"last_name": "Smith",
"phone_number": "6470123456"
```


### Created User 3
```
"id": 3,
"username": "JackSun",
"email": "jack@sun.com",
"password": "123",
"first_name": "Jack",
"last_name": "Sun",
"phone_number": "6470000000"
```

#### Created Property 1
```
"id": 1,
"host": 1,
"title": "Definitely not Robarts",
"base_price": 800,
"longitude": "-79.3994500124",
"latitude": "43.6645625368",
"address": "130 St. George St., Toronto, ON",
"rating": "0.0",
"bedrooms": 2,
"distance": 0.35754,
"bathrooms": 2,
"guest_limit": 4,
"propertyimage_set": [
    {
        "id": 1,
        "image": "http://localhost:8000/media/images/dog.jpg"
    }
],
"unavailable_set": [
    {
        "id": 1,
        "start_date": "2022-07-24",
        "end_date": "2022-07-28",
        "is_reservation": false,
        "request": null
    }
],
"priceadjustment_set": [
    {
        "id": 1,
        "start_date": "2023-10-01",
        "end_date": "2023-10-30",
        "price_per_night": "1000.00"
    }
]
```

#### Property Request 1: Jane Smith requesting John Doe's property

```
"id": 1,
"created": "2023-03-19T03:53:18.255490Z",
"status": "pending",
"type": "property",
"start_date": "2023-05-04",
"end_date": "2023-05-19",
"expiry_date": "2023-04-29",
"receiver": 1,
"requester": 2,
"property": 1
```

#### Property Request 1: Jane Smith requesting John Doe's property

```
"id": 2,
"created": "2023-03-19T04:37:50.269000Z",
"status": "approved",
"type": "property",
"start_date": "2023-09-29",
"end_date": "2023-09-30",
"expiry_date": "2023-04-29",
"receiver": 1,
"requester": 2,
"property": 1
```