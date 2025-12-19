› (CONSULTA REALIZADA A BACKEND ) :Los turnos que solicita el alumno pasan a "Solicitudes de Turnos" el cual debe     
  poder "rechazarse" como esta el contrato para dicho estado cuando se cancela el    
  mismo.



RESPUESTA:

• Así está el contrato actual para turnos solicitados:

  - Cuando el alumno cancela su propia solicitud:
      - Endpoint: PATCH /slots/:id/cancelar (solo rol alumno aprobado).
      - Body: vacío {}.
      - Resultado en backend: estado pasa a "Disponible" y reviewStatus a "A
        revisar". No queda como “Rechazado”; simplemente vuelve a la bolsa de turnos 
        disponibles.
  - Cuando el profesor/superadmin rechaza una solicitud (caso “Rechazado”):
      - Endpoint: PATCH /slots/:id/estado (roles profesor/superadmin).
      - Body: { "estado": "rechazado" } (también acepta rechazada/desaprobado/       
        desaprobada/pendiente/a revisar/revisar/en revision/aprobado/aprobada).      
      - Resultado en backend: reviewStatus se normaliza a "Desaprobado" y estado     
        queda "Rechazado".

  En “Solicitudes de Turnos”:

  - Si el alumno cancela, el turno deja de ser “Solicitado” y ya no debería mostrarse    como solicitud (queda “Disponible”).
  - Si se rechaza desde el flujo de revisión (profesor), el estado esperado en       
    frontend es “Rechazado” (backend lo devuelve así).