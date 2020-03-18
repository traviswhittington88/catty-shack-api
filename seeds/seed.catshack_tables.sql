BEGIN; 

TRUNCATE
  notifications,
  likes,
  comments,
  meows,
  catshack_users
  RESTART IDENTITY CASCADE;

INSERT INTO catshack_users (user_name, password, user_image, location, bio)
  VALUES
    ('MouseHunter55', 'iLoveMeece100$$', 'uploads/no-img.png', 'Moonshine Holler, WV', 'Like to chase meece in my spare time'),
    ('PurrMinator', 'fatcatslovefood', 'uploads/no-img.png','Branson, MS', 'Love to stretch out and get my sosh on'),
    ('TomCat57', 'AAaa11$$', 'uploads/no-img.png', 'New Mexico, NM', 'Stray Life is the good life'),
    ('AristoCat', 'AAaa11$$', 'uploads/no-img.png', 'Sandy Heights, MI', 'Just a fun lovin kitten'),
    ('twhitty88', 'asDF12#$', 'uploads/no-img.png','New York, NY', 'Hi I''m Tom from New York');

INSERT INTO meows (userHandle, body, user_image)
  VALUES 
    ('TomCat57','Wow this place is purrific', 'uploads/no-img.png'),
    ('AristoCat','Last one to the litterbox is a rotten rat', 'uploads/no-img.png');
    

 --INSERT INTO comments (user_name, meow_id, body)
 -- VALUES
 --   ('MouseHunter55', 1, 'Meow, what a meow meow'),
 --   ('MouseHunter55', 1, 'Yea this place is legit for the kit!'),
 --  ('PurrMinator', 2, 'Puuuuuuriffic!');


--INSERT INTO likes (user_name, meow_id) 
--  VALUES
--    ('TomCat57', 2),
--    ('AristoCat', 1);

  COMMIT;