import { Component, OnInit } from '@angular/core';
import { GraphqlService } from './graphql.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'angulargraphqlclient';
  constructor(private graphqlService: GraphqlService) {
  }

  async ngOnInit() {
    await this.graphqlService.projects();
  }
}
