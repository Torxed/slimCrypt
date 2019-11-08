let key_format = 'AES-CBC';
let key_size = 256;

function sizeOf(o) { return Object.keys(o).length; }

function wrap_key_in_pubkey(struct, one_time_key, publicKey, func) {
	let options = {   //these are the algorithm options
		name: "RSA-OAEP",
		hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
	};
	window.crypto.subtle.importKey("jwk", publicKey, options, true, ["wrapKey"]).then(function(publicKey_loaded){
		console.log(publicKey_loaded);
		let options = {   //these are the wrapping key's algorithm options
			name: "RSA-OAEP",
			hash: {name: "SHA-256"},
		};

		window.crypto.subtle.wrapKey("raw", one_time_key, publicKey_loaded, options).then(function(wrapped){
			func(btoa(new Uint8Array(wrapped)));
		}).catch(function(err){
			console.error(err);
		});
	}).catch(function(err){
		console.error(err);
	});
}

function generate_one_time_key(func) {
	window.crypto.subtle.generateKey({
		name: key_format,
		length: key_size
	}, true, ["encrypt", "decrypt"]).then(function(one_time_key) { // false = Extractable key (via .exportKey()) ?
		func(one_time_key);
	});
}

function encrypt_with_key(data, key, func) {
	let options = {
		name: key_format,
		iv: window.crypto.getRandomValues(new Uint8Array(16))
	};

	let encoder = new TextEncoder("utf-8");
	let bytes = encoder.encode(data);

	window.crypto.subtle.encrypt(options, key, bytes).then(function(encrypted){
		func({
			'key_format' : key_format,
			'iv' : options.iv,
			'key' : key,
			'b64_encrypted_payload' : btoa(new Uint8Array(encrypted))
		})
	});
}

function generate_identity(callback) {
	console.log('moo');
	/** 
	 * Stores a identity in localStorage['identity']
	 * SHA-256 / RSA-OAEP
	*/
	let options = {
		name: "RSA-OAEP",
		modulusLength: 2048, //can be 1024, 2048, or 4096
		publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
		hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
	};

	// ["encrypt", "decrypt"]
	window.crypto.subtle.generateKey(options, true, ["wrapKey", "unwrapKey"]).then(function(key){
		// Iterate over both:
		// * privateKey
		// * publicKey
		// And store those, each with individual timers (respecting each others lock)
		for(let key_obj in {'publicKey':true, 'privateKey':true}) {
			window.crypto.subtle.exportKey("jwk", key[key_obj]).then(function(key_data) {
				callback(key_obj, key_data);
				/*
				setTimer(key_obj+"IdentityExport", function() {
					if(!localStorage.getItem("lock")) {
						localStorage.setItem("lock", true);

						let identity = localStorage.getItem("identity");
						if(!identity || typeof identity === "undefined")
							identity = {};
						else
							identity = JSON.parse(identity);

						identity[key_obj] = key_data;
						localStorage.setItem("identity", JSON.stringify(identity));

						localStorage.removeItem("lock");
						clearTimer(key_obj+"IdentityExport");
					} else {
						print(key_obj+"IdentityExport waiting for lock");
					}
				}, 500)
				*/
			}).catch(function(err){
				console.error("Error in exporting key to identity:");
				console.error(err);
			});
			
		}
	}).catch(function(err){
		console.error("Error in generating identity key-pair:");
		console.error(err);
	});
}
