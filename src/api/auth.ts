import axios from "axios";
import apiInstance from "./apiInstance";
import { Cookie } from "lucide-react";



interface TokenResponse {
    access: string;
    refresh: string; 
}

interface UserData{
    id: number;
    email: string;
    full_name?: string;
    [key: string]: any;
}

interface ApiResponse<T>{
    data:T | null;
    error: string | null
}

export const login = async (email: string, password:string) : Promise<ApiResponse<TokenResponse>> => 
{
    try{
        const {data, status} = await apiInstance.post<TokenResponse>(`/Auth/login`, {email, password});

        if (status === 200){
            //setAuthUser() //Функция которая устанавливает в zustand состояне авторизации пользователя
        }
    } catch(error){

    }
    return new ApiResponse<TokenResponse>(){data: new {acceess: "asdfasdfas", }}
}

export const setAuthUser = (access_token: string, refresh_token: string) : void => {
    Cookie.set("access_token", access_token, {
        expire: 1,
        secure: true,
    });
}

