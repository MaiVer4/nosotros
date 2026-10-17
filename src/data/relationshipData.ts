import type { RelationshipConfig } from '../types';

export const initialRelationshipConfig: RelationshipConfig = {
  partner1: "Maicol",
  partner2: "Vanessa",
  relationshipStartDate: "2025-07-11T00:00:00",
  secretPin: "1107",
  daughter: {
    name: "Vaiolet",
    status: "expecting", // Cambia a "born" cuando nazca o usa el botón en la web
    gestationWeeksAtRefDate: 39,
    refDate: "2026-10-17",
    estimatedDueDate: "2026-10-24",
    pregnancyNote: "39 semanas de puro amor, pataditas y una dulce espera que llena nuestros corazones de emoción. Mamá y papá ya tienen todo listo para tu llegada.",
    ultrasoundImages: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=1000&q=80',
        caption: 'La pancita de mamá con 39 semanas de amor puro'
      },
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1000&q=80',
        caption: 'Los primeros zapatitos y la ropita que preparamos para Vaiolet'
      },
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80',
        caption: 'Escuchando los latidos más bellos del mundo'
      }
    ],
    // Datos preparados para cuando nazca:
    birthDate: undefined,
    birthWeight: "3.25 kg",
    birthLength: "49 cm",
    birthCity: "Con todo el amor de mamá y papá",
    birthNote: "El día más feliz de nuestras vidas: ¡Llegó nuestra princesa Vaiolet al mundo!"
  },
  memories: [
    {
      id: "mem-1",
      title: "El día en que comenzó nuestra historia",
      date: "2025-07-11",
      category: "inicio",
      isFavorite: true,
      location: "Donde el corazón supo que eras tú",
      description: "Un 11 de julio que cambió nuestras vidas para siempre. El día de nuestro primer 'sí' oficial, cuando decidimos caminar juntos y construir paso a paso esta historia llena de complicidad, risas y amor sincero.",
      tags: ["Aniversario", "Nuestro Primer Sí", "Inicio"],
      media: [
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1000&q=80",
          caption: "El comienzo del viaje más hermoso de mi vida contigo"
        }
      ]
    },
    {
      id: "mem-2",
      title: "Nuestra primera gran escapada juntos",
      date: "2025-09-18",
      category: "viaje",
      isFavorite: false,
      location: "Un rincón especial",
      description: "Nuestros primeros días lejos de la rutina, descubriendo lugares nuevos de la mano, cantando canciones en el camino y dándonos cuenta de que cualquier lugar del mundo es perfecto si estoy a tu lado.",
      tags: ["Viajes", "Aventuras", "Complicidad"],
      media: [
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1000&q=80",
          caption: "Coleccionando atardeceres y recuerdos inolvidables"
        }
      ]
    },
    {
      id: "mem-3",
      title: "Nuestro primer Año Nuevo juntos",
      date: "2025-12-31",
      category: "especial",
      isFavorite: true,
      location: "Bajo las estrellas y las 12 uvas",
      description: "Despedir el 2025 mirándote a los ojos y agradecer por haberte encontrado. A las doce de la noche, con un beso sellamos la promesa de que el 2026 sería nuestro año... ¡y vaya que lo ha sido!",
      tags: ["Año Nuevo", "Deseos", "Promesas"],
      media: [
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?auto=format&fit=crop&w=1000&q=80",
          caption: "Brindando por todo lo que la vida nos tenía preparado"
        }
      ]
    },
    {
      id: "mem-4",
      title: "¡La noticia más hermosa: Vamos a ser papás!",
      date: "2026-03-08",
      category: "embarazo",
      isFavorite: true,
      location: "En casa, con lágrimas de felicidad",
      description: "El momento en que las dos rayitas aparecieron. Se nos paralizó el tiempo, nos abrazamos con el alma y lloramos de alegría pura. Un pedacito de nosotros dos empezaba a crecer en la pancita de Vanessa. No existen palabras para describir ese instante.",
      tags: ["Positivo", "Futuros Papás", "Milagro"],
      media: [
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=1000&q=80",
          caption: "El inicio del milagro más grande de nuestro amor"
        }
      ]
    },
    {
      id: "mem-5",
      title: "¡Es una niña! Bienvenida a nuestros sueños, Vaiolet",
      date: "2026-05-14",
      category: "embarazo",
      isFavorite: true,
      location: "Revelación de sexo con nuestras familias",
      description: "El color rosa invadió la habitación y nuestros corazones estallaron de dicha: ¡Una princesita viene en camino! Su nombre: Vaiolet. Desde ese día no dejamos de imaginar sus ojitos, sus manitas y cómo iluminará nuestro hogar.",
      tags: ["Revelación", "Es Una Niña", "Vaiolet"],
      media: [
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1000&q=80",
          caption: "El día en que supimos que te llamarías Vaiolet"
        }
      ]
    },
    {
      id: "mem-6",
      title: "Nuestro Primer Aniversario (1 Año de Amor)",
      date: "2026-07-11",
      category: "hito",
      isFavorite: true,
      location: "Celebrando 365 días de pura magia",
      description: "Cumplimos nuestro primer año juntos. Mirar atrás y ver cómo nos hemos apoyado, cómo crecimos como pareja y la dicha de celebrarlo con Vanessa luciendo la pancita más hermosa del universo.",
      tags: ["1 Año", "Aniversario", "Amor Infinito"],
      media: [
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80",
          caption: "365 días amándote y eligiéndote cada día"
        }
      ]
    },
    {
      id: "mem-7",
      title: "El Baby Shower de nuestra princesa Vaiolet",
      date: "2026-09-06",
      category: "embarazo",
      isFavorite: false,
      location: "Rodeados de toda la familia y amigos",
      description: "Una tarde llena de juegos, abrazos, bendiciones y mucho amor para Vaiolet. Ver tantos regalitos pequeños y sentir el cariño de toda la familia nos hizo sentir los papás más afortunados del mundo.",
      tags: ["Baby Shower", "Celebración", "Familia"],
      media: [
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1000&q=80",
          caption: "Llenando de amor y cariño la llegada de Vaiolet"
        }
      ]
    },
    {
      id: "mem-8",
      title: "Semana 39: La dulce espera en su momento cumbre",
      date: "2026-10-17",
      category: "vaiolet",
      isFavorite: true,
      location: "En casita, con la maleta lista",
      description: "Semana 39 cumplida. Cada movimiento en la barriga es una caricia al alma. Mamá está hermosa, radiante y valiente; papá no puede dejar de acariciar la pancita y hablarle a Vaiolet. En cualquier instante el teléfono sonará y correremos al hospital para el encuentro más esperado.",
      tags: ["Semana 39", "Cuenta Regresiva", "Ya Casi Llegas"],
      media: [
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1537655780520-1e392ead81f2?auto=format&fit=crop&w=1000&q=80",
          caption: "Cualquier día, cualquier hora... ¡Te amamos Vaiolet!"
        }
      ]
    }
  ],
  letters: [
    {
      id: "let-1",
      title: "Para cuando sientas nervios por el parto",
      author: "Maicol",
      recipient: "Vanessa",
      openWhen: "Ábreme cuando sientas miedo, cansancio o nervios por la llegada de Vaiolet",
      dateWritten: "2026-10-17",
      sealColor: "#f43f68",
      content: `Mi amor Vanessa,

Sé que en estos días las emociones están a flor de piel. Sientes el peso del embarazo, los dolores y probablemente esa incertidumbre natural de enfrentarte al parto y a convertirte en mamá.

Quiero que recuerdes algo con cada latido de tu corazón: eres la mujer más valiente, noble y fuerte que conozco. Tu cuerpo ha creado la vida de nuestra hija Vaiolet con una perfección que me llena de admiración y respeto todos los días.

No estás sola. Ni por un solo segundo. Voy a estar tomando tu mano, respirando contigo, secando tus lágrimas y celebrando cada esfuerzo. Juntos trajimos a Vaiolet hasta aquí y juntos la recibiremos con los brazos abiertos. Eres y serás la mejor mamá que nuestra hija pudo soñar.

Te amo con toda mi alma, mi reina hermosa. Lo vas a hacer increíble.

Siempre tuyo,
Maicol.`
    },
    {
      id: "let-2",
      title: "Carta para nuestra princesa Vaiolet",
      author: "Ambos",
      recipient: "Vaiolet",
      openWhen: "Para Vaiolet, cuando aprenda a leer o en su cumpleaños especial",
      dateWritten: "2026-10-17",
      sealColor: "#e11d53",
      content: `Nuestra amada Vaiolet,

Te escribimos estas líneas cuando aún estás calientita en la barriga de mamá, cumpliendo 39 semanas de gestación. Afuera el mundo te espera, pero sobre todo, te esperan dos personas que ya te aman más que a sus propias vidas: tus papás, Maicol y Vanessa.

No sabes cuántas noches nos quedamos despiertos acariciando la pancita, hablándote despacito, imaginando el color de tus ojitos y soñando con escuchar tu risa por primera vez. Eres el fruto de un amor verdadero, puro y leal.

Queremos prometerte que siempre tendrás un hogar lleno de abrazos sinceros, comprensión y risas. Nunca dudes de lo valiosa, única y amada que eres. Viniste a darle sentido a todo.

Con todo el amor del universo,
Tus papás, Maicol y Vanessa.`
    },
    {
      id: "let-3",
      title: "Para cuando tengamos un día difícil",
      author: "Ambos",
      recipient: "Nosotros",
      openWhen: "Ábreme cuando la rutina, el cansancio o una discusión nos haga olvidar la magia",
      dateWritten: "2026-10-17",
      sealColor: "#cb9e5b",
      content: `Recuerda el 11 de julio de 2025. Recuerda las risas tontas del principio, las miradas que no necesitaban palabras y cómo elegimos conscientemente caminar juntos en las buenas y en las malas.

La vida de padres y de pareja no siempre es un camino fácil, habrá noches sin dormir, estrés y días pesados. Pero antes de irnos a dormir enojados o distantes, démonos un abrazo apretado de 10 segundos en silencio. 

Somos un equipo. Somos Maicol, Vanessa y Vaiolet. Nada en este mundo puede con nosotros si nos mantenemos unidos. Te elijo hoy, mañana y siempre.`
    },
    {
      id: "let-4",
      title: "Para el día de nuestro aniversario",
      author: "Maicol",
      recipient: "Vanessa",
      openWhen: "Ábreme cada 11 de julio para celebrar un año más",
      dateWritten: "2026-07-11",
      sealColor: "#be1243",
      content: `¡Feliz Aniversario mi vida!

Parece que fue ayer cuando empezamos a escribir esta historia y hoy miro todo lo que hemos construido y me quedo sin aliento. Gracias por cada sonrisa, por tu ternura, por tu paciencia infinita y por hacerme el hombre más feliz de la tierra.

Brindo por muchos 11 de julio más, por envejecer juntos de la mano y por ver crecer a nuestra hermosa familia. Te amo más de lo que las palabras alcanzan a expresar.`
    }
  ]
};
