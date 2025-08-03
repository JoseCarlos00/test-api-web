const DOMAIN = "https://192.168.1.4:3000"

const API_GET_ALL_MSM = DOMAIN + '/api/messages';
const API_LOGIN = DOMAIN + '/api/auth/login';
const API_LOGOUT = DOMAIN + '/api/auth/logout';
const API_REFRESH_TOKEN = DOMAIN + '/api/auth/refresh';

// Variable en memoria para guardar el Access Token. Es más seguro que localStorage.
let accessToken = null;



// Elementos del DOM
const resultadoElement = document.getElementById('resultado');
const buttonGetAllMessages = document.getElementById('solicitarMensajes');
const loginForm = document.getElementById('loginForm');
const logoutButton = document.getElementById('logoutButton');

// Add Events Listeners
buttonGetAllMessages.addEventListener('click', solicitarMensajes);
loginForm.addEventListener('submit', handleSubmitLogin);
logoutButton.addEventListener('click', handleLogout);


// Solicitar token enviando username y password en el body
async function solicitarMensajes() {
	// Primero, verificamos si el usuario ha iniciado sesión (si tenemos un token)
	if (!accessToken) {
		resultadoElement.textContent = 'Debes iniciar sesión primero.';
		return;
	}

	try {
		const response = await fetch(API_GET_ALL_MSM, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`, // Usamos el token guardado
			},
		});

		// Si la respuesta es 401, el token expiró. Intentamos refrescarlo.
		if (response.status === 401) {
			console.log('Access Token expirado. Intentando refrescar...');
			const refreshedSuccessfully = await refreshToken();

			// Si el refresco fue exitoso, reintentamos la solicitud original
			if (refreshedSuccessfully) {
				console.log('Token refrescado. Reintentando la solicitud de mensajes...');
				return solicitarMensajes(); // Llamada recursiva para reintentar
			} else {
				resultadoElement.textContent =
					'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
				return;
			}
		}

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || `Error del servidor: ${response.status}`);
		}

		const data = await response.json();
		console.log(data);

		if (data.message) {
			resultadoElement.textContent =
				JSON.stringify(data['message']) + '\n' + JSON.stringify(data['data']);
		} else {
			resultadoElement.textContent = JSON.stringify(data);
		}
	} catch (error) {
		console.error('Error al solicitar mensajes:', error);
		resultadoElement.textContent = `Error al solicitar mensajes: ${error.message}`;
	}
}

async function refreshToken() {
	try {
		const response = await fetch(API_REFRESH_TOKEN, {
			method: 'POST',
			credentials: 'include', // Esencial para que envíe la cookie HttpOnly
		});

		if (!response.ok) {
			// Si el refresh token también falla, la sesión ha terminado.
			handleLogout(); // Limpiamos el estado del cliente
			return false;
		}

		const data = await response.json();
		accessToken = data.accessToken; // Guardamos el nuevo accessToken
		console.log('Nuevo accessToken obtenido.');
		return true;
	} catch (error) {
		console.error('Error fatal al refrescar el token:', error);
		handleLogout();
		return false;
	}
}

async function handleSubmitLogin(e) {
  e.preventDefault();

  const username = e.target.username.value;
  const password = e.target.password.value;

  try {
		const response = await fetch(API_LOGIN, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({ username, password }),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || 'Credenciales incorrectas');
		}

		const data = await response.json();
		const { message, payload } = data;

		// 1. Guardar el accessToken en la variable en memoria
		accessToken = data.accessToken;
		console.log('Login exitoso. AccessToken guardado.');

		// 2. Actualizar la UI para reflejar el estado de "logueado"
		document.getElementById('username').textContent = `Usuario: ${payload.username}`;
		loginForm.style.display = 'none';
		logoutButton.style.display = 'block';
		resultadoElement.textContent = '¡Has iniciado sesión correctamente!';
	} catch (error) {
		console.error('Error al iniciar sesión:', error);
		resultadoElement.textContent = `Error al iniciar sesión: ${error.message}`;
	}
}

async function handleLogout() {
	try {
		// Llamamos al endpoint del servidor para que invalide el refresh token
		await fetch(API_LOGOUT, { method: 'POST', credentials: 'include' });
	} catch (error) {
		console.error('La llamada a la API de logout falló, pero se procederá a limpiar el cliente:', error);
	} finally {
		// Limpiamos el estado del cliente sin importar si la API falló
		accessToken = null;
		document.getElementById('username').textContent = 'No autenticado';
		loginForm.style.display = 'block';
		logoutButton.style.display = 'none';
		resultadoElement.textContent = 'Has cerrado sesión.';
		console.log('Logout del cliente completado.');
	}
}
