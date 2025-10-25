import { TCourse } from "@core/models/common/Course";
import { ApiState } from "./common";
import { create } from "zustand";
import { getLearnFeed } from "@/api/student/learn";

export interface LearnState extends  ApiState{
    course_feed: TCourse[],
    fetchFeed: ()=>Promise<boolean>,
}

export const useLearnStore = create<LearnState>((set)=>({
    is_loading: false,
    api_message: "",
    course_feed: [],
    fetchFeed: async()=> {
        //returns true if success
        try {
            set({is_loading: true});
            const res = await getLearnFeed();
            if(res.error) return false
            set({api_message: res.message});
            set({course_feed: res.result.active_courses})
            return true
        } catch (error) {
            set({is_loading: false});
            set({api_message: "Unknown Error"});
             return false
        }finally{
            set({is_loading: false});
        }
    },
}))