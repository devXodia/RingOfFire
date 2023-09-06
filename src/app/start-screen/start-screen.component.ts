import { Component, inject } from '@angular/core';
import { DocumentReference, Firestore, addDoc, collection } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Game } from 'src/models/game';

@Component({
  selector: 'app-start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.scss']
})
export class StartScreenComponent {

  firestore: Firestore = inject(Firestore);
  gamesCollection = collection(this.firestore, 'games');
  game: Game;

  constructor(private router: Router){

  }

newGame(){
  this.game = new Game();
  let gameInfo = addDoc(this.gamesCollection, this.game.toJson()).then((docRef: DocumentReference) => {
    this.router.navigate(['/game', docRef.id]);
  });
}

}
