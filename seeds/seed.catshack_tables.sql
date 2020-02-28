BEGIN; 

TRUNCATE
  notifications,
  likes,
  comments,
  meows,
  catshack_users
  RESTART IDENTITY CASCADE;

INSERT INTO catshack_users (user_name, password)
  VALUES
    ('MouseHunter55', 'iLoveMeece100$$'),
    ('PurrMinator', 'fatcatslovefood');

INSERT INTO meows (userHandle, body)
  VALUES 
    ('TomCat57','Wow this place is purrific'),
    ('AristoCat','Last one to the litterbox is a rotten rat');
    

INSERT INTO comments (user_name, meow_id, body)
  VALUES
    ('MouseHunter55', 1, 'Meow, what a meow meow'),
    ('MouseHunter55', 1, 'Yea this place is legit for the kit!'),
    ('PurrMinator', 2, 'Puuuuuuriffic!');


INSERT INTO likes (user_name, meow_id) 
  VALUES
    ('TomCat57', 2),
    ('AristoCat', 1);

  COMMIT;