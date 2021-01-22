INSERT INTO department (name)
VALUES ('Legal'),
    ('Sales'),
    ('Engineering');
INSERT INTO roles (title, salary, department_id)
VALUES ('Legal Team Lead', 250000, 1),
    ('Lawyer', 170000, 1),
    ('Sales Lead', 100000, 2),
    ('Salesperson', 70000, 2),
    ('Lead Engineer', 150000, 3),
    ('Engineer', 120000, 3);
INSERT INTO manager (first_name, last_name)
SELECT first_name,
    last_name
FROM employee
WHERE manager_confirm = 1;
INSERT INTO employee (
        first_name,
        last_name,
        role_id,
        manager_id,
        manager_confirm
    )
VALUES ('Jerry', 'Underwood', 1, null, true),
    ('Bob', 'Sheldon', 2, 1, false),
    ('Jason', 'Mendoza', 2, 1, false),
    ('Alex', 'Jackson', 3, null, true),
    ('Peter', 'Makah', 4, 2, false),
    ('Suzie', 'Alisson', 4, 2, false),
    ('John', 'Winger', 4, 2, false),
    ('Pete', 'McFall', 5, null, true),
    ('Alexis', 'Caper', 6, 3, false),
    ('Mason', 'Jacobson', 6, 3, false);