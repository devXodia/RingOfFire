import { Component, OnInit } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  pickCardAnimation = false;
  currentCard: string = '';
  game: Game;
  ngOnInit(): void {
    this.newGame();
  }

  constructor(public dialog: MatDialog, private router: Router) {
  }

  newGame() {
    this.game = new Game();
  }

  startGame = false;
  endGame = false;

  restartGame(){
    this.router.navigateByUrl('');
  }

  takeCard() {
    if(this.allCardsPlayed()){
      this.gameOver();
    }
    if (!this.pickCardAnimation && this.startGame) {
      this.currentCard = this.game.stack.pop();
      this.pickCardAnimation = true;
      
      this.game.currentPlayer++
      this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;
      setTimeout(() => {
        this.game.playedCards.push(this.currentCard);
        
        this.pickCardAnimation = false;
      }, 1000);
      
    }
  }

  allCardsPlayed(){
    return this.game.playedCards.length == 52;
  }

  gameOver(){
    this.endGame = true;
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      if(name && name.length > 0){
        this.game.players.push(name);
        if(this.game.players.length >= 2){
          this.startGame = true;
        }
        
      }
      
    });
  }

  
}
