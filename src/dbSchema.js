let db = [
  meows = [
    { 
      meow_id: 2,
      userHandle: 'user',
      body: 'this is the meow body',
      dateCreated: '2020-02-23 17:37:08.765087',
      likeCount: 5,
      commentCount: 2
    }
  ]
]

const userDetails = {
  // Redux data
  credentials: {
    id: '4',
    user_name: 'Stray88',
    dateCreated: '2020',
    user_image: 'uploads/no-img.png',
    bio: 'Hello I\'m Fred',
    website: 'http://user.com',
    location: 'Midwest US'
  },
  likes: [
    {
      userHandle: 'users',
      meow_id: '3'
    },
    {
      userHandle: 'stray88',
      meow_id: '5'
    }
  ]
};