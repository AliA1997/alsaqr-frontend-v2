import { makeAutoObservable, reaction } from "mobx";
import Auth from "../utils/auth";
import { ServerError } from "typings";
import { SidebarTabs } from "@models/enums";

export default class CommonStore {
  error: ServerError | null = null;
  token: string | null = new Auth().getToken();
  appLoaded = false;

  alertMessage: string[] = [];
  alertsDisplayed: boolean = false;

  currentTab: SidebarTabs | undefined = undefined;
  constructor() {
    makeAutoObservable(this);

    reaction(
      () => this.token,
      (token) => {
        if (token) {
          new Auth().setToken(token);
        } else {
          new Auth().clearToken();
        }
      }
    );
  }

  setServerError = (error: ServerError) => {
    this.error = error;
  };

  setToken = (token: string | null) => {
    this.token = token;
  };

  setAppLoaded = () => {
    this.appLoaded = true;
  };

  setCurrentTab = (t: SidebarTabs | undefined) => {
    this.currentTab = t;
  }

  addAlertMessage = (alert: string) => {
    if (!this.alertMessage) this.alertMessage = [];

    this.alertMessage.push(alert);
  };

  loadScriptByURL = (id: string, url: string, callback: () => void) => {
    const isScriptExist = document.getElementById(id);

    if (!isScriptExist) {
      let script = document.createElement("script");
      script.type = "text/javascript";
      script.src = url;
      script.id = id;
      script.onload = function () {
        if (callback) callback();
      };
      document.body.appendChild(script);
    }

    if (isScriptExist && callback) callback();
  };
}