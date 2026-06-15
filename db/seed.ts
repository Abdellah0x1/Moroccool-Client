import {readFile} from "fs/promises"
import "dotenv/config"
import { createClient } from "@supabase/supabase-js";
import type {Place} from "@/types/index"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);


async function loadData(){
    const file = await readFile(`db/data.json`, "utf-8");
    const data = JSON.parse(file) as Place[];

    const {data: results ,error} = await supabase.from("etablissement").insert(data).select();

    if(error) return console.log("error importing data", error);
    console.log("data imported");
}


loadData()





