
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { IncomingMessage, ServerResponse } from 'http';

export default defineConfig({
    plugins: [
        {
            name: 'connect-api',
            configureServer(server) {
                server.middlewares.use('/api/save-projects', (req: IncomingMessage, res: ServerResponse, next) => {
                    if (req.method === 'POST') {
                        let body = '';
                        req.on('data', chunk => {
                            body += chunk.toString();
                        });
                        req.on('end', () => {
                            const filePath = path.resolve(process.cwd(), 'src/data/projects.json');
                            fs.writeFile(filePath, body, (err) => {
                                if (err) {
                                    res.statusCode = 500;
                                    res.end('Error writing file');
                                } else {
                                    res.statusCode = 200;
                                    res.end('File saved successfully');
                                }
                            });
                        });
                    } else {
                        next();
                    }
                });

                server.middlewares.use('/api/save-content', (req: IncomingMessage, res: ServerResponse, next) => {
                    if (req.method === 'POST') {
                        let body = '';
                        req.on('data', chunk => {
                            body += chunk.toString();
                        });
                        req.on('end', () => {
                            const filePath = path.resolve(process.cwd(), 'src/data/content.json');
                            fs.writeFile(filePath, body, (err) => {
                                if (err) {
                                    res.statusCode = 500;
                                    res.end('Error writing file');
                                } else {
                                    res.statusCode = 200;
                                    res.end('File saved successfully');
                                }
                            });
                        });
                    } else {
                        next();
                    }
                });

                // Image Upload Middleware
                server.middlewares.use('/api/upload-image', (req: IncomingMessage, res: ServerResponse, next) => {
                    if (req.method === 'POST') {
                        const url = new URL(req.url || '', `http://${req.headers.host}`);
                        const filename = url.searchParams.get('filename');

                        if (!filename) {
                            res.statusCode = 400;
                            res.end('Filename is required');
                            return;
                        }

                        // Sanitize filename
                        const safeFilename = path.basename(filename).replace(/[^a-zA-Z0-9.-]/g, '_');
                        const uploadDir = path.resolve(process.cwd(), 'public/uploads');

                        if (!fs.existsSync(uploadDir)) {
                            fs.mkdirSync(uploadDir, { recursive: true });
                        }

                        const filePath = path.join(uploadDir, safeFilename);
                        const writeStream = fs.createWriteStream(filePath);

                        req.pipe(writeStream);

                        req.on('end', () => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ path: `/uploads/${safeFilename}` }));
                        });

                        req.on('error', (err) => {
                            console.error('Upload error:', err);
                            res.statusCode = 500;
                            res.end('Upload failed');
                        });
                    } else {
                        next();
                    }
                });
                // Message APIs
                server.middlewares.use('/api/send-message', (req: IncomingMessage, res: ServerResponse, next) => {
                    if (req.method === 'POST') {
                        let body = '';
                        req.on('data', chunk => body += chunk.toString());
                        req.on('end', () => {
                            const messagesPath = path.resolve(process.cwd(), 'src/data/messages.json');
                            const newMessage = JSON.parse(body);
                            newMessage.id = Date.now();
                            newMessage.date = new Date().toLocaleString();

                            fs.readFile(messagesPath, 'utf8', (err, data) => {
                                const messages = err ? [] : JSON.parse(data || '[]');
                                messages.push(newMessage);
                                fs.writeFile(messagesPath, JSON.stringify(messages, null, 2), () => {
                                    res.statusCode = 200;
                                    res.end('Message sent');
                                });
                            });
                        });
                    } else {
                        next();
                    }
                });

                server.middlewares.use('/api/get-messages', (req: IncomingMessage, res: ServerResponse, next) => {
                    if (req.method === 'GET') {
                        const messagesPath = path.resolve(process.cwd(), 'src/data/messages.json');
                        fs.readFile(messagesPath, 'utf8', (err, data) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(data || '[]');
                        });
                    } else {
                        next();
                    }
                });

                server.middlewares.use('/api/delete-message', (req: IncomingMessage, res: ServerResponse, next) => {
                    if (req.method === 'POST') {
                        let body = '';
                        req.on('data', chunk => body += chunk.toString());
                        req.on('end', () => {
                            const { id } = JSON.parse(body);
                            const messagesPath = path.resolve(process.cwd(), 'src/data/messages.json');

                            fs.readFile(messagesPath, 'utf8', (err, data) => {
                                let messages = err ? [] : JSON.parse(data || '[]');
                                messages = messages.filter((m: any) => m.id !== id);
                                fs.writeFile(messagesPath, JSON.stringify(messages, null, 2), () => {
                                    res.statusCode = 200;
                                    res.end('Message deleted');
                                });
                            });
                        });
                    } else {
                        next();
                    }
                });
            }
        }
    ]
});
