import foto from '../../sources/fotoCv.jpeg'
import styles from './aboutMe.module.css'

function AboutMe() {
  return (
    <section>
      <div className={styles.textContainer}>
        <h2>About me</h2>

        <p>
          Me llamo Tomás, soy de Buenos Aires, Argentina. Comencé a estudiar
          desarrollo web mediante cursos hasta ingresar en la Tecnicatura de
          Desarrollo Web y Aplicaciones Móviles que dicta el ISPC. A partir de
          ahí, estoy desarrollando diversos proyectos tanto personales como del
          estudio, lo que me permite avanzar en mi carrera profesional Ahora
          mismo estoy incursionando en el freelance, aunque también estoy
          interesado en trabajar bajo dependencia. Mi objetivo es poder vivir de
          esta pasión que es la creación de páginas web,hacer que mi hobby sea
          mi trabajo, lo cual considero que es muy importante para la salud
          mental de uno mismo.
        </p>
      </div>

      <img src={foto} alt="" className={styles.img}/>
    </section>
  );
}
export default AboutMe;
