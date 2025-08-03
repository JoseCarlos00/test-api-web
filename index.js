const DOMAIN = "https://192.168.1.4:3000"

const API_GET_ALL_MSM = DOMAIN + '/api/messages';
const API_LOGIN = DOMAIN + '/api/auth/login';
const API_LOGOUT = DOMAIN + '/api/auth/logout';
const API_REFRESH_TOKEN = DOMAIN + '/api/auth/refresh';



// Elementos del DOM
const resultadoElement = document.getElementById('resultado');
const buttonGetAllMessages = document.getElementById('solicitarMensajes');
const loginForm = document.getElementById('loginForm');
const logoutButton = document.getElementById('logoutButton');

// Add Events Listeners
buttonGetAllMessages.addEventListener('click', solicitarMensajes);
loginForm.addEventListener('submit', handleSubmitLogin);


// Solicitar token enviando username y password en el body
async function solicitarMensajes() {

	try {
		const token = ''
		const response = await fetch(API_GET_ALL_MSM, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
			},
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


async function handleSubmitLogin(e) {
  e.preventDefault();

  const username = event.target.username.value;
  const password = event.target.password.value;

  try {
		const response = await fetch(API_LOGIN, {
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
    
		// Guardar accessToken

    document.getElementById('username').textContent = payload.username;
	} catch (error) {
    console.error('Error al iniciar sesión:', error);
    resultadoElement.textContent = 'Error al iniciar sesión';
  }

}
  
