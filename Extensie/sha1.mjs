// sha1.mjs fucntie sha1
function sha1(message) {
    const msgBuffer = new TextEncoder().encode(message);
    return crypto.subtle.digest("SHA-1", msgBuffer).then(buffer => {
        return Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    });
}

export default sha1;
