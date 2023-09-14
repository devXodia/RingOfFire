import { Component, OnInit, inject } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, getDoc, addDoc, collection, collectionData, onSnapshot} from '@angular/fire/firestore';
import { Observable,  } from 'rxjs';


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
  gameData;
 
  


    async ngOnInit(): Promise<void> {
    

    this.newGame();

    this.route.params.subscribe((params) => {
      const customDocumentId = params['id'];
      this.subGameList(customDocumentId);
  
})
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

  getGameCollection(){
    return collection(this.firestore, 'games');
  }

    
  subGameList(customDocumentId){
      return onSnapshot(this.getGameCollection(), (list) => {
        // this.normalNotes = [];
        list.forEach((element) => {
          // this.normalNotes.push(this.setNoteObject(element.data(), element.id));
          if (element.id == customDocumentId){
            const gameData = element.data();
            this.game.currentPlayer = gameData['currentPlayer'];
            this.game.players = gameData['players'];
            this.game.playedCards = gameData['playedCards'];
            this.game.stack = gameData['stack'];
          }
        });
      });
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


