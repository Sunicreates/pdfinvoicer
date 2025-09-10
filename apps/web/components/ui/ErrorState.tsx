import React from 'react';

export default function ErrorState({ message = 'An error occurred.' }: { message?: string }) {
	return <div style={{ color: 'red', padding: '1rem' }}>{message}</div>;
}
