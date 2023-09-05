import { Component, OnInit, inject } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, collectionData } from '@angular/fire/firestore';
import {
  DocumentData,
  DocumentReference,
  addDoc,
  collection,
  doc,
  setDoc,
  DocumentSnapshot,
  getDoc
} from 'firebase/firestore';
import { Observable, from } from 'rxjs';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  pickCardAnimation = false;
  currentCard: string = '';
  game: Game;
  firestore: Firestore = inject(Firestore);
  games$: Observable<any>;

  ngOnInit(): void {
    this.newGame();
    this.route.params.subscribe((params) => {


      // console.log(params['id']);
      // const customDocumentId = params['id'];
      // const itemCollection = collection(this.firestore, 'games');
      // this.games$ = collectionData(itemCollection);
      // const gameData = this.game.toJson();
      // const documentRef = doc(this.firestore, 'games', customDocumentId);
      // setDoc(documentRef, gameData);
      // this.games$.subscribe((game) => {
      //   console.log(game);
      // });
      console.log(params['id']);
      const customDocumentId = params['id'];
      
      // Create a reference to the document with the custom ID
      const documentRef = doc(this.firestore, 'games', customDocumentId);
      
      // Use from() to create an observable from the promise returned by getDoc()
      const game$ = from(getDoc(documentRef));
      
      // Subscribe to the observable
      game$.subscribe((docSnapshot) => {
        if (docSnapshot.exists()) {
          const gameData = docSnapshot.data();
          console.log(gameData);
          this.game.currentPlayer = gameData['currentPlayer'];
          this.game.playedCards = gameData['playedCards'];
          this.game.players = gameData['players'];
          this.game.stack = gameData['stack'];

        } else {
          console.log('Document does not exist.');
        }})
    
    
    });


  }

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  newGame() {
    this.game = new Game();
  }

  startGame = false;
  endGame = false;

  restartGame() {
    this.router.navigateByUrl('');
  }

  takeCard() {
    if (this.allCardsPlayed()) {
      this.gameOver();
    }
    if (!this.pickCardAnimation && this.startGame) {
      this.currentCard = this.game.stack.pop();
      this.pickCardAnimation = true;

      this.game.currentPlayer++;
      this.game.currentPlayer =
        this.game.currentPlayer % this.game.players.length;
      setTimeout(() => {
        this.game.playedCards.push(this.currentCard);

        this.pickCardAnimation = false;
      }, 1000);
    }
  }

  allCardsPlayed() {
    return this.game.playedCards.length == 52;
  }

  gameOver() {
    this.endGame = true;
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name && name.length > 0) {
        this.game.players.push(name);
        if (this.game.players.length >= 2) {
          this.startGame = true;
        }
      }
    });
  }
}
