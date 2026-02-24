-- College Fest Management System Database
-- Created for XAMPP/MySQL

-- Create Database
CREATE DATABASE IF NOT EXISTS college_fest_db;
USE college_fest_db;

-- Users Table (Admin & Users)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    college VARCHAR(200),
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(200) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    venue VARCHAR(200) NOT NULL,
    max_participants INT DEFAULT 100,
    registration_fee DECIMAL(10,2) DEFAULT 0.00,
    image_url VARCHAR(255),
    status ENUM('upcoming', 'ongoing', 'completed') DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event Registrations Table
CREATE TABLE IF NOT EXISTS registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_status ENUM('pending', 'completed') DEFAULT 'pending',
    team_name VARCHAR(100),
    team_members TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE KEY unique_registration (user_id, event_id)
);

-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert Default Admin User
-- Password: admin123 (PLAIN TEXT - NOT RECOMMENDED FOR PRODUCTION)
INSERT INTO users (name, email, password, phone, college, role) VALUES 
('Admin', 'admin@fest.com', 'admin123', '1234567890', 'Admin College', 'admin');

-- Insert Sample User
-- Password: user123 (PLAIN TEXT - NOT RECOMMENDED FOR PRODUCTION)
INSERT INTO users (name, email, password, phone, college, role) VALUES 
('John Doe', 'user@fest.com', 'user123', '9876543210', 'Sample College', 'user');

-- Insert Sample Events
INSERT INTO events (event_name, event_type, description, event_date, event_time, venue, max_participants, registration_fee, status) VALUES
('Tech Hackathon 2024', 'Technical', 'A 24-hour coding marathon to build innovative solutions', '2024-03-15', '09:00:00', 'Computer Lab, Block A', 50, 200.00, 'upcoming'),
('Battle of Bands', 'Cultural', 'Showcase your musical talent in this epic band competition', '2024-03-16', '18:00:00', 'Main Auditorium', 10, 500.00, 'upcoming'),
('Street Dance Competition', 'Cultural', 'Show off your dance moves in various street dance styles', '2024-03-17', '14:00:00', 'Open Stage, Campus Ground', 30, 150.00, 'upcoming'),
('Quiz Championship', 'Academic', 'Test your general knowledge across various categories', '2024-03-18', '10:00:00', 'Seminar Hall', 40, 100.00, 'upcoming'),
('Photography Contest', 'Creative', 'Capture the essence of the fest through your lens', '2024-03-19', '11:00:00', 'Exhibition Hall', 60, 50.00, 'upcoming'),
('Gaming Tournament', 'Sports & Gaming', 'Compete in popular esports titles for amazing prizes', '2024-03-20', '13:00:00', 'Gaming Arena, Block C', 32, 300.00, 'upcoming');

-- Insert Sample Announcements
INSERT INTO announcements (title, content, priority, created_by) VALUES
('Welcome to College Fest 2024!', 'Get ready for the most exciting college fest of the year. Early bird registrations are now open!', 'high', 1),
('Event Schedule Released', 'The complete schedule for all events has been published. Check the events section for details.', 'medium', 1),
('Food Stalls Available', 'Various food stalls will be available throughout the fest. Enjoy delicious food while participating!', 'low', 1);