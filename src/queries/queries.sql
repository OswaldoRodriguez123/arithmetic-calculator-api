INSERT INTO public.users
(id, username, "password", status, created_at, updated_at, "name")
VALUES('1', 'admin@loanpro.io', '$2a$10$IpYYh2w87KxjILtGJNsJLeQ2wPwvNfTOCGW4kdfAgNkv1kxM.NaAm', 'active', NULL, NULL, 'Admin');

INSERT INTO public.operations
(id, "type", "cost", created_at, updated_at, "name")
VALUES('1', 'addition', 1, NULL, NULL, 'Addition');
INSERT INTO public.operations
(id, "type", "cost", created_at, updated_at, "name")
VALUES('2', 'subtraction', 2, NULL, NULL, 'Subtraction');
INSERT INTO public.operations
(id, "type", "cost", created_at, updated_at, "name")
VALUES('3', 'multiplication', 3, NULL, NULL, 'Multiplication');
INSERT INTO public.operations
(id, "type", "cost", created_at, updated_at, "name")
VALUES('4', 'division', 4, NULL, NULL, 'Division');
INSERT INTO public.operations
(id, "type", "cost", created_at, updated_at, "name")
VALUES('5', 'square_root', 5, NULL, NULL, 'SquareRoot');
INSERT INTO public.operations
(id, "type", "cost", created_at, updated_at, "name")
VALUES('6', 'random_string', 6, NULL, NULL, 'RandomString');
