BEGIN; 

TRUNCATE 
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
    ('PurrMinator', 2, 'Puuuuuuriffic!');
  COMMIT;