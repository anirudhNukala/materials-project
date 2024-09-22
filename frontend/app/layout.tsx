import React, { ReactNode } from 'react';
import './globals.css';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <html lang="en">
            <head>
                <title>Materials Insight</title>
            </head>
            <body style={{ fontFamily: 'Arial, sans-serif' }}>
                <header style={{ padding: '10px 20px', backgroundColor: '#3a3f44', color: 'white', textAlign: 'center' }}>
                </header>
                <main style={{ padding: '20px' }}>{children}</main>
            </body>
        </html>
    );
};

export default Layout;
