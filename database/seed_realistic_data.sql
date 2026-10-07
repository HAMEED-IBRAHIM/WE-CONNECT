-- First, clear existing data (except admin if it exists) to avoid conflicts
DELETE FROM likes;
DELETE FROM comments;
DELETE FROM posts;
DELETE FROM users WHERE email != 'admin@alumniplatform.com';

-- Insert realistic Alumni
INSERT INTO users (id, name, email, password, role, company, department, job_title, bio, verification_status, created_at, updated_at) VALUES 
(gen_random_uuid(), 'Arjun Mehta', 'arjun.mehta@example.com', '$2a$10$xyz...', 'ALUMNI', 'Google', 'Computer Science', 'Senior Software Engineer', 'Passionate about distributed systems and cloud architecture. Always happy to mentor students.', 'APPROVED', NOW() - INTERVAL '100 days', NOW()),
(gen_random_uuid(), 'Priya Sharma', 'priya.sharma@example.com', '$2a$10$xyz...', 'ALUMNI', 'Microsoft', 'Information Technology', 'Product Manager', 'Building the next generation of productivity tools. Ex-IITB.', 'APPROVED', NOW() - INTERVAL '80 days', NOW()),
(gen_random_uuid(), 'Rahul Desai', 'rahul.desai@example.com', '$2a$10$xyz...', 'ALUMNI', 'McKinsey & Company', 'Mechanical Engineering', 'Management Consultant', 'Transitioned from core engineering to strategy consulting. Ask me anything about consulting prep!', 'APPROVED', NOW() - INTERVAL '60 days', NOW()),
(gen_random_uuid(), 'Sneha Reddy', 'sneha.reddy@example.com', '$2a$10$xyz...', 'ALUMNI', 'Amazon', 'Computer Science', 'SDE II', 'Working in the AWS core team.', 'APPROVED', NOW() - INTERVAL '40 days', NOW()),
(gen_random_uuid(), 'Vikram Singh', 'vikram.singh@example.com', '$2a$10$xyz...', 'ALUMNI', 'Goldman Sachs', 'Electrical Engineering', 'Quantitative Analyst', 'Algorithmic trading and financial modeling.', 'APPROVED', NOW() - INTERVAL '20 days', NOW());

-- Insert realistic Students
INSERT INTO users (id, name, email, password, role, department, bio, verification_status, created_at, updated_at) VALUES 
(gen_random_uuid(), 'Ayesha Khan', 'ayesha.k@student.edu', '$2a$10$xyz...', 'STUDENT', 'Computer Science', 'Final year CS undergrad looking for SDE roles in Fintech.', 'NOT_SUBMITTED', NOW() - INTERVAL '10 days', NOW()),
(gen_random_uuid(), 'Rohan Gupta', 'rohan.g@student.edu', '$2a$10$xyz...', 'STUDENT', 'Mechanical Engineering', 'Interested in robotics and automation. Seeking internships for Summer 2027.', 'NOT_SUBMITTED', NOW() - INTERVAL '5 days', NOW());

-- We need to get the UUIDs of the inserted users to create posts. 
-- Let's do this using a PL/pgSQL block to safely insert posts and comments.

DO $$
DECLARE
    arjun_id UUID;
    priya_id UUID;
    rahul_id UUID;
    ayesha_id UUID;
    post1_id UUID := gen_random_uuid();
    post2_id UUID := gen_random_uuid();
    post3_id UUID := gen_random_uuid();
BEGIN
    SELECT id INTO arjun_id FROM users WHERE email = 'arjun.mehta@example.com';
    SELECT id INTO priya_id FROM users WHERE email = 'priya.sharma@example.com';
    SELECT id INTO rahul_id FROM users WHERE email = 'rahul.desai@example.com';
    SELECT id INTO ayesha_id FROM users WHERE email = 'ayesha.k@student.edu';

    -- Insert Posts
    INSERT INTO posts (id, author_id, title, content, image_url, tags, created_at, updated_at) VALUES 
    (post1_id, arjun_id, 'My journey from Campus to Google', 'Five years ago, I was sitting exactly where you are right now. The transition from college to the corporate world at Google was challenging but incredibly rewarding. Here are 3 things I wish I knew: 1. Focus on core CS fundamentals. 2. Networking is just as important as coding. 3. Dont be afraid to ask questions.', 'https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Career,Google,Advice', NOW() - INTERVAL '5 days', NOW()),
    
    (post2_id, rahul_id, 'Case Interview Prep Session this Sunday', 'Hey everyone! I will be hosting a mock case interview session this Sunday for anyone interested in management consulting. We will be covering profitability frameworks and market entry strategies. Leave a comment if you want to join the zoom call!', NULL, 'Consulting,Interview,Mentorship', NOW() - INTERVAL '2 days', NOW()),
    
    (post3_id, ayesha_id, 'Looking for guidance on Fintech resumes', 'Hi Alumni! I am currently tailoring my resume for quant and SDE roles in Fintech companies. Would any of the seniors working in this domain be willing to do a quick 15-minute resume review? I would be incredibly grateful!', NULL, 'Resume,Help,Fintech', NOW() - INTERVAL '1 days', NOW());

    -- Insert Comments
    INSERT INTO comments (id, post_id, author_id, content, created_at, updated_at) VALUES 
    (gen_random_uuid(), post1_id, ayesha_id, 'This is so inspiring Arjun! Thank you for sharing. What resources did you use for system design?', NOW() - INTERVAL '4 days', NOW()),
    (gen_random_uuid(), post1_id, priya_id, 'Great advice Arjun. Completely agree on point #3.', NOW() - INTERVAL '3 days', NOW()),
    (gen_random_uuid(), post2_id, ayesha_id, 'I would love to join! Please share the link.', NOW() - INTERVAL '1 days', NOW());

END $$;
