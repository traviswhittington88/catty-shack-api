# Catty Shack API

This is an Express server contained within the NodeJS infrastructure that handles authentication and routing requests to a PostgreSQL database that houses data for Catty Shack.

To setup this repo, clone it to an empty project folder (git clone) and install all dependencies using the npm install command. The node package manager is used to perform all of the setup, installation, migration and testing commands. See package.json for more information.

## Install

    npm install

## Run the app

    npm run dev

## Run the tests

    npm t

# REST API

The REST API to the Catty Shack application is described below.

## Login

### Request

`POST /api/auth/login` 
`Place user_name & password in response body as a json object, e.g. 
{
	"user_name": "twhitty89",
	"password": "password"
}

`
    curl -i -H 'Accept: application/json' -d 'user_name=testUser' 'password='password' http://localhost:7000/api/auth/login

### Response

The response for all entries will be an array of entry objects in json format

{
    "authToken": "authToken",
    "id": 6,
    "userhandle": "example_user",
    "user_image": "uploads/example_image.png"
}

## Post A Meow

### Request

`POST /api/meows`

    curl -i -H 'Accept: application/json' -d 'body=Foo' http://localhost:7000/api/entries

### Response

returns status 201 and new entry object

{
    "meow_id": 4,
    "userHandle": "twhitty89",
    "body": "Meow from twhitty89",
    "user_image": "uploads/2020-03-16T19:10:09.383Zgrey-fur-kitten-127028.jpg",
    "date_created": "2020-03-17T00:52:59.841Z",
    "likeCount": 0,
    "commentCount": 0
}
    

## Delete A Meow

### Request

`DELETE /api/meows/:meow_id`

    curl -i -H 'Accept: application/json' -X DELETE http://localhost:8000/api/meows/2

### Response

returns 204 (no content) status


## Attempt To Delete The Same Meow

### Request

`DELETE /api/entries/:meow_id`

    curl -i -H 'Accept: application/json' -X DELETE http://localhost:7000/api/meows/1

### Response

returns status 404 (not found)

    {"status":404,"reason":"Not found"}
    
 
## Get A Specific Meow

### Request

`GET /api/journals/:meow_id`

    curl -i -H 'Accept: application/json' http://localhost:8000/api/meows/:meow_id
    

### Response

returns status 200 (ok) and journal object

    {
       "meow_id": 4,
       "userHandle": "twhitty89",
       "body": "Meow from twhitty89",
       "user_image": "uploads/2020-03-16T19:53:26.746Zgrey-fur-kitten-127028.jpg",
       "date_created": "2020-03-17T00:52:59.841Z",
       "likeCount": 0,
       "commentCount": 0
    }


## Get All Meows

### Request

`GET /api/meows`

    curl -i -H 'Accept: application/json' http://localhost:8000/api/meows
    
### Response

The response for all journals will be an array of journal objects in json format
`
[
    {
        "meow_id": 4,
        "userHandle": "twhitty89",
        "body": "Meow from twhitty89",
        "user_image": "uploads/2020-03-16T19:53:26.746Zgrey-fur-kitten-127028.jpg",
        "date_created": "2020-03-17T00:52:59.841Z",
        "likeCount": 0,
        "commentCount": 0
    },
    {
        "meow_id": 2,
        "userHandle": "AristoCat",
        "body": "Last one to the litterbox is a rotten rat",
        "user_image": "uploads/no-img.png",
        "date_created": "2020-03-13T04:40:05.985Z",
        "likeCount": 0,
        "commentCount": 0
    },
    {
        "meow_id": 1,
        "userHandle": "TomCat57",
        "body": "Wow this place is purrific",
        "user_image": "uploads/no-img.png",
        "date_created": "2020-03-13T04:40:05.985Z",
        "likeCount": 0,
        "commentCount": 0
    }
] `

## Post A Comment

### Request

`POST /api/meows/:meow_id/comments

{
	"body": "Yo Aristocat.. it's your boy twhitty89"
}`

    curl -i -H 'Accept: application/json' -d 'body='new comment' http://localhost:8000/api/meows/2/comments

### Response

responds with 201 (created) status and comment

`  {
    "user_name": "twhitty89",
    "meow_id": 2,
    "body": "Yo Aristocat.. it's your boy twhitty89",
    "date_created": "2020-03-17T00:56:12.809Z",
    "user_image": "uploads/2020-03-16T19:53:26.746Zgrey-fur-kitten-127028.jpg"
}`

## Like A Meow

### Request

`GET /api/meows/:meow_id/like`

    curl -i -H 'Accept: application/json' http://localhost:8000/api/meows/2/like
    
### Response

`{
    "meow_id": 3,
    "userhandle": "twhitty89",
    "body": "Meow from twhitty89",
    "user_image": "uploads/2020-03-14T06:21:21.691Zgrey-fur-kitten-127028.jpg",
    "date_created": "2020-03-15T08:11:46.722Z",
    "likecount": 1,
    "commentcount": 0
}`

## Unlike A Meow

### Request

`GET /api/meows/:meow_id/unlike`

    curl -i -H 'Accept: application/json' http://localhost:8000/api/meows/2/unlike
    
### Response

`{
    "meow_id": 3,
    "userhandle": "twhitty89",
    "body": "Meow from twhitty89",
    "user_image": "uploads/2020-03-14T06:21:21.691Zgrey-fur-kitten-127028.jpg",
    "date_created": "2020-03-15T08:11:46.722Z",
    "likecount": 0,
    "commentcount": 0
}`


