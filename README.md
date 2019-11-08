# slimCrypt
Javascript wrapper for subtle.crypto

# Installation

# Usage

### Encrypting a string

```javascript
let string_to_be_encrypted = "A message or something";
generate_one_time_key((one_time_key) => {
    encrypt_with_key(string_to_be_encrypted, one_time_key, (encrypt_struct) => {
        wrap_key_in_pubkey(encrypt_struct, one_time_key, connected_to['publicKey'], (wrapped_key) => {
            let struct = {
                'payload': encrypt_struct['b64_encrypted_payload'],
                'key' : wrapped_key,
                'iv' : btoa(encrypt_struct['iv']),
                'key_format' : encrypt_struct['key_format'],
                "access_token": access_token
            }
            socket.send(struct);
        });
    });
})
```

### Decrypting a string

```javascript
let struct = {
    'payload': encrypt_struct['b64_encrypted_payload'],
    'key' : wrapped_key,
    'iv' : btoa(encrypt_struct['iv']),
    'key_format' : encrypt_struct['key_format'],
    "access_token": access_token
}

let array = JSON.parse("["+atob(struct['payload'])+"]");
let encrypted_message = new Uint8Array(array);
let one_time_key_wrapped = new Uint8Array(JSON.parse("["+atob(struct['key'])+"]"));

load_private_key(keys['privateKey'], (privateKey) => {
    extract_one_time_key(one_time_key_wrapped, privateKey, (one_time_key) => {
        let options = {
            name: struct['key_format'],
            iv: new Uint8Array(JSON.parse("["+atob(struct['iv'])+"]"))
        };
        decrypt_with_key(options, one_time_key, encrypted_message, (decrypted_message) => {
            console.log(decrypted_message)
        });
    });
});
```
