import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, getDoc, addDoc, collection, collectionData, onSnapshot, updateDoc, deleteDoc} from '@angular/fire/firestore';
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
  currentGameId;
  unsubGame;


    async ngOnInit(): Promise<void> {
    

    this.newGame();

    this.route.params.subscribe((params) => {
      this.currentGameId = params['id'];
      this.subGameList();
  
})
}

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.unsubGame = this.subGameList();
  }

  ngOnDestrory(){
    this.unsubGame();
    this.deleteGameFromDatabase();
  }

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

    
  subGameList(){
      return onSnapshot(this.getGameCollection(), (list) => {
        list.forEach((element) => {
          
          if (element.id == this.currentGameId){
            const gameData = element.data();
            this.game.currentPlayer = gameData['currentPlayer'];
            this.game.players = gameData['players'];
            this.game.playedCards = gameData['playedCards'];
            this.game.stack = gameData['stack'];
            if(this.game.players.length >= 2){
              this.startGame = true;
            }
          }
        });
      });
    }
    

    async deleteGameFromDatabase(){
      await deleteDoc(this.getCurrentGame());
    }

    async updateGame(){
        let docRef = this.getCurrentGame();
        await updateDoc(docRef, this.game.toJson()).catch(
          (err) => {console.log(err); }
        );
    } 

    async addGameToDatabase() {
      try {
        const docRef = await addDoc(this.getGameCollection(), this.game.toJson());
        console.log(docRef)
      } catch (err) {
        console.error(err);
      }
    }

    getCurrentGame(){ {
        return doc(collection(this.firestore, 'games'), this.currentGameId);
      }
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
    this.updateGame();
  }

  allCardsPlayed() {
    return this.game.playedCards.length == 52;
  }

  gameOver() {
    this.endGame = true;
    this.deleteGameFromDatabase();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name && name.length > 0) {
        this.game.players.push(name);
        this.updateGame();
        if (this.game.players.length >= 2) {
          this.startGame = true;
          this.updateGame();
        }
      }
    });
  }
}


