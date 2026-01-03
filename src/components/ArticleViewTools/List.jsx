import React from "react";


const people = [
  'Creola Katherine Johnson: mathematician',
  'Mario José Molina-Pasquel Henríquez: chemist',
  'Mohammad Abdus Salam: physicist',
  'Percy Lavon Julian: chemist',
  'Subrahmanyan Chandrasekhar: astrophysicist'
];

export default function ItemList() {
  const listItems = people.map(person => <li><button>{person}</button></li>);

  return <ul>{listItems}</ul>;
}
