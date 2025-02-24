import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { IUserMainCurrencyResponse } from '../models/user-main-currency-response';
import { IUserAmountResponse } from '../models/user-amount-response';
import { IUserStatisticsResponse } from '../models/user-statistics-response';
import { IUserMainCurrencyRequest } from '../models/user-main-currency-request';
import { CurrencyCodes } from 'src/app/shared/models/currency-codes';
import { ConfigurationService } from 'src/app/shared/services/configuration.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _data: IUserStatisticsResponse = {
    errors: [],
    salaries: [],
    spendingCategories: [],
    amount: 0,
    mainCurrency: CurrencyCodes.USD,
    currencyBalances: [],
    currencyRates: [],
  };
  private _userStatistics$: BehaviorSubject<IUserStatisticsResponse>;
  private _amount$: BehaviorSubject<number>;
  private _userMainCurrency$: BehaviorSubject<CurrencyCodes>;

  public constructor(private httpClient: HttpClient, private config: ConfigurationService) {
    this._userStatistics$ = new BehaviorSubject<IUserStatisticsResponse>({
      amount: 0,
      errors: [],
      mainCurrency: CurrencyCodes.USD,
      salaries: [],
      spendingCategories: [],
      currencyBalances: [],
      currencyRates: [],
    });
    this._amount$ = new BehaviorSubject<number>(0);
    this._userMainCurrency$ = new BehaviorSubject<CurrencyCodes>(CurrencyCodes.USD);
  }

  public get userStatistics$(): Observable<IUserStatisticsResponse> {
    return this._userStatistics$.asObservable();
  }

  public get amount$(): Observable<number> {
    return this._amount$.asObservable();
  }

  public get userMainCurrency$(): Observable<CurrencyCodes> {
    return this._userMainCurrency$.asObservable();
  }

  public getUserStatistics() {
    return this.httpClient
      .get<IUserStatisticsResponse>(this.config.getUserStatisticsUrl())
      .subscribe({
        next: (data: IUserStatisticsResponse) => {
          this._data = data;
          this._userStatistics$.next(data);
          this._amount$.next(data.amount as number);
          this._userMainCurrency$.next(data.mainCurrency);
        },
        error: (error) => {
          console.error(JSON.stringify(error));
        },
      });
  }

  public getUserAmount() {
    return this.httpClient.get<IUserAmountResponse>(this.config.getUserAmountUrl()).subscribe({
      next: (data: IUserAmountResponse) => {
        this._data.amount = data.amount;
        this._amount$.next(data.amount);
        this._userStatistics$.next(this._data);
      },
      error: (error) => {
        console.error(JSON.stringify(error));
      },
    });
  }

  public putUserAmount(amount: number) {
    return this.httpClient.put(this.config.getUserAmountUrl(), { amount: amount });
  }

  public convertCurrencyCodeToString(code: CurrencyCodes): string {
    return CurrencyCodes[code];
  }

  public convertCurrencyCodeToCurrencySymbol(code: CurrencyCodes): string {
    switch (code) {
      case CurrencyCodes.UAH: {
        return 'UAH';
      }
      case CurrencyCodes.USD: {
        return '$';
      }
      case CurrencyCodes.GBP: {
        return '£';
      }
      case CurrencyCodes.EUR: {
        return '€';
      }
    }
  }

  public getUserMainCurrency() {
    return this.httpClient
      .get<IUserMainCurrencyResponse>(this.config.getUserMainCurrencyUrl())
      .pipe(
        tap((result) => {
          console.log('User main currency: ' + JSON.stringify(result));
        }),
      )
      .subscribe({
        next: (data: IUserMainCurrencyResponse) => {
          this._data.mainCurrency = data.mainCurrency;
          this._userMainCurrency$.next(data.mainCurrency);
          this._userStatistics$.next(this._data);
        },
        error: (error) => {
          console.error(JSON.stringify(error));
        },
      });
  }

  public setUserMainCurrency(currency: IUserMainCurrencyRequest) {
    return this.httpClient.put(this.config.getUserMainCurrencyUrl(), currency);
  }

  public convertStringCurrencyToCurrencyCode(currency: string): CurrencyCodes {
    if (currency === CurrencyCodes[CurrencyCodes.UAH]) {
      return CurrencyCodes.UAH;
    }

    if (currency === CurrencyCodes[CurrencyCodes.USD]) {
      return CurrencyCodes.USD;
    }

    if (currency === CurrencyCodes[CurrencyCodes.EUR]) {
      return CurrencyCodes.EUR;
    }

    if (currency === CurrencyCodes[CurrencyCodes.GBP]) {
      return CurrencyCodes.GBP;
    }

    return CurrencyCodes.USD;
  }

  public getCurrenciesList(): string[] {
    const result: string[] = [];

    for (const key in CurrencyCodes) {
      const isValueProperty = parseInt(key, 10) >= 0;
      if (isValueProperty) {
        result.push(CurrencyCodes[key]);
      }
    }

    return result;
  }
}
