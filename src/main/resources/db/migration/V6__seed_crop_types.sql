INSERT INTO crop_type (name_en, name_bn) VALUES
('Rice', 'ধান'),
('Wheat', 'গম'),
('Potato', 'আলু'),
('Tomato', 'টমেটো'),
('Onion', 'পেঁয়াজ'),
('Jute', 'পাট')
ON DUPLICATE KEY UPDATE name_en=name_en;
