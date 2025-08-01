// Llamada de prueba a una API pública (puedes cambiarla por tu backend)
const API_URL = 'https://jsonplaceholder.typicode.com/users/1';

const API_URL_GET_ALL_MSM = 'http://localhost:3000/api/messages';
const API_URL_TOKEN = 'http://localhost:3000/api/auth/login';

// Elementos del DOM

const buttonLlamarAPI = document.getElementById('llamarAPI');
const buttonVerCookies = document.getElementById('verCookies');
const buttonBorrarCookies = document.getElementById('borrarCookies');

const buttonSolicitarToken = document.getElementById('solicitarMensajes');

const resultadoElement = document.getElementById('resultado');

buttonLlamarAPI.addEventListener('click', llamarAPI);
buttonVerCookies.addEventListener('click', verCookies);
buttonBorrarCookies.addEventListener('click', borrarCookies);

buttonSolicitarToken.addEventListener('click', solicitarMensajes);

// Llamar a la API
async function llamarAPI() {
	try {
		const response = await fetch(API_URL);
		const data = await response.json();

		// Guardar una cookie con la respuesta simulando un token
		document.cookie = `nombre=${data.name}; path=/; max-age=3600`; // dura 1 hora
		resultadoElement.textContent = `Nombre guardado en cookie: ${data.name}`;
	} catch (error) {
		console.error('Error al llamar API:', error);
		resultadoElement.textContent = 'Error al llamar a la API';
	}
}

// Ver cookies disponibles
function verCookies() {
	resultadoElement.textContent = `Cookies actuales:\n${document.cookie}`;
}

// Borrar cookies (simulación)
function borrarCookies() {
	document.cookie = 'nombre=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
	resultadoElement.textContent = 'Cookies eliminadas.';
}



// Solicitar token enviando username y password en el body
async function solicitarMensajes() {

	try {
    const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIxMjM0Iiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTQwODE3NzIsImV4cCI6MTc1NDA4MjY3Mn0.xUibptCTulPzLTKCXPUGQxzEiEdw69_Pq5zHMn30ZeU';
    console.log({token});

		const response = await fetch(API_URL_GET_ALL_MSM, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
			},
      credentials: 'include',
		});
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
		resultadoElement.textContent = 'Error al solicitar mensajes';
	}
}

const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = event.target.username.value;
  const password = event.target.password.value;

  try {
		const response = await fetch(API_URL_TOKEN, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({ username, password }),
		});

		const data = await response.json();
    const {accessToken, message, payload} = data;
    console.log({accessToken, message, payload});
    

		// Guardar el token en una cookie
		// Guardar el token en una cookie
		document.cookie = `token=${accessToken}; path=/; max-age=3600`; // dura 1 hora
		resultadoElement.textContent = `Token guardado en cookie: ${accessToken}`;

    document.getElementById('username').textContent = payload.username;
	} catch (error) {
    console.error('Error al iniciar sesión:', error);
    resultadoElement.textContent = 'Error al iniciar sesión';
  }
});
  
